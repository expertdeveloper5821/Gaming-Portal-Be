import { Request, Response } from "express";
import RoomId from "../models/serverRoomIDModels";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import { user } from "../models/passportModels";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import moment from 'moment-timezone';
import { userType } from '../middlewares/authMiddleware';


// Configuration
cloudinary.config({
  cloud_name: environmentConfig.CLOUD_NAME,
  api_key: environmentConfig.API_KEY,
  api_secret: environmentConfig.API_SECRET
});


// Create a new room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const {
      roomId,
      gameName,
      gameType,
      mapType,
      password,
      version,
      dateAndTime,
      entryFee,
      lastSurvival,
      highestKill,
      secondWin,
      thirdWin
    } = req.body;

    // Check for required fields
    const requiredFields = ['roomId', 'gameName', 'gameType', 'mapType', 'password', 'version', 'dateAndTime', 'entryFee', 'lastSurvival', 'highestKill', 'secondWin', 'thirdWin'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(', ');
      return res.status(400).json({ message: `${missingFieldsMessage} field is required` });
    }

    const file = req.file;

    // Define req.user before accessing its properties
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    const newUuid = uuidv4();

    let secure_url: string | null = null;
    if (file) {
      const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(
        file.path
      );
      secure_url = uploadResponse.secure_url;
    }

    // Parse date and time into Date objects
    const parsedDateAndTime = moment(dateAndTime).tz('Asia/Kolkata');

    if (!parsedDateAndTime.isValid()) {
      return res.status(400).json({ message: 'Invalid date or time format' });
    }

    const createdRoom = await RoomId.create({
      roomUuid: newUuid,
      roomId,
      gameName,
      gameType,
      mapType,
      password,
      mapImg: secure_url,
      version,
      createdBy: userId,
      dateAndTime,
      entryFee,
      lastSurvival,
      highestKill,
      secondWin,
      thirdWin
    });

    return res.status(200).json({
      message: "Room created successfully",
      uuid: newUuid,
      _id: createdRoom._id
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to create room",
      success: false
    });
  }
};

// Get all rooms
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let roomsQuery = {};

    if (search) {
      roomsQuery = {
        $or: [
          { gameName: { $regex: search, $options: 'i' } },
          { gameType: { $regex: search, $options: 'i' } },
          { mapType: { $regex: search, $options: 'i' } },
          { version: { $regex: search, $options: 'i' } },
          { entryFee: { $regex: search, $options: 'i' } },
          { lastSurvival: { $regex: search, $options: 'i' } },
          { highestKill: { $regex: search, $options: 'i' } },
          { secondWin: { $regex: search, $options: 'i' } },
          { thirdWin: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const rooms = await RoomId.find(roomsQuery);

    if (rooms.length === 0) {
      return res.status(404).json({ message: search ? 'No rooms found with the provided query' : 'No rooms found' });
    }

    const roomsWithUserDetails = await Promise.all(
      rooms.map(async (room) => {
        const userInfo = await user.findOne({ _id: room.createdBy });
        return {
          ...room.toObject(),
          createdBy: userInfo ? userInfo.fullName : 'Unknown',
        };
      })
    );

    return res.status(200).json(roomsWithUserDetails);
  } catch (error) {
    return res.status(500).json({ error: 'Failed to fetch rooms' });
  }
};


// Get a single room by ID
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await RoomId.findById(id);
    if (!room) {
      return res.status(404).json({ error: "Room not found" });
    }

    const userInfo = await user.findOne({ _id: room.createdBy });

    if (!userInfo) {
      return res.status(500).json({ error: "User not found" });
    }

    // Replacing the createdBy field with the user's fullName
    const roomWithFullName = {
      ...room.toObject(), // Convert room to a plain JavaScript object
      createdBy: userInfo.fullName,
    };

    return res.status(200).json({ room: roomWithFullName });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch room" });
  }
};



// Update a room by ID
export const updateRoomById = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const updatedRoomData = req.body;

    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const existingRoom = await RoomId.findById(roomId);

    if (!existingRoom) {
      return res.status(404).json({ message: "Room not found" });
    }

    // Update the room data
    await RoomId.findByIdAndUpdate(roomId, updatedRoomData);

    return res.status(200).json({ message: "Room updated successfully" });

  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to update room",
      success: false,
    });
  }
};

// Delete a room by ID
export const deleteRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const deletedRoom = await RoomId.findByIdAndDelete(id);
    if (!deletedRoom) {
      return res.status(404).json({ error: "Room not found" });
    }
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete room" });
  }
};


// get all room that created by only that perticular role user
export const getUserRooms = async (req: Request, res: Response) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const secretKey = environmentConfig.JWT_SECRET;
    try {
      const decoded: any = jwt.verify(token, secretKey);
      const userId = decoded.userId;

      // Fetch rooms associated with the specific user
      const userRooms = await RoomId.find({ createdBy: userId });

      return res.status(200).json(userRooms);
    } catch (error) {
      console.error(error);
      return res.status(401).json({ message: "Invalid token" });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch user rooms",
      success: false,
    });
  }
};