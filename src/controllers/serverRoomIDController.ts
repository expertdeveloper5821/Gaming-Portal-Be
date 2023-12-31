import { Request, Response } from "express";
import RoomId from "../models/serverRoomIDModels";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import { user } from "../models/passportModels";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import moment from 'moment-timezone';
import { Transaction } from "../models/qrCodeModel";
import { userType } from '../middlewares/authMiddleware';
import { Team } from "../models/teamModel";


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
      thirdWin,
      availableSlots: 25, // Fixed number of slots
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
    const { search, sortingKey } = req.query;
    const token = req.header("Authorization")?.replace("Bearer ", "");

    // Define a variable to store the user's registered room IDs
    let userRegisteredRooms: string[] = [];

    if (token) {
      // If the token is present, decode it to get the user's ID
      const secretKey = environmentConfig.JWT_SECRET;
      try {
        const decoded: any = jwt.verify(token, secretKey);
        const userId = decoded.userId;

        // Retrieve the list of rooms the user has registered for
        const userTransactions = await Transaction.find({
          paymentBy: userId,
        });

        // Extract the room IDs from the user's transactions
        userRegisteredRooms = userTransactions.map((transaction) => transaction.roomId);
      } catch (error) {
        console.error(error);
        return res.status(401).json({ error: "Invalid token" });
      }
    }
    // Construct the query to fetch rooms
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

    // Fetch all rooms based on the query
    const rooms = await RoomId.find(roomsQuery);

    // Filter the rooms to exclude those the user has already registered for
    const filteredRooms = rooms.filter((room) => !userRegisteredRooms.includes(room.roomUuid));

    // Sort the rooms by createdAt based on the 'latestFirst' and 'previousFirst' keys
    let sortedRooms = filteredRooms;
    if (sortingKey === 'latestFirst') {
      sortedRooms = filteredRooms.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortingKey === 'previousFirst') {
      sortedRooms = filteredRooms.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }

    if (filteredRooms.length === 0) {
      return res.status(202).json({
        message: search ? "No rooms found with the provided query" : "No rooms found",
      });
    }

    // Add user details to the filtered rooms
    const roomsWithUserDetails = await Promise.all(
      filteredRooms.map(async (room) => {
        const userInfo = await user.findOne({ _id: room.createdBy });
        const updatedUserInfo = await user.findOne({ _id: room.updatedBy });
        return {
          ...room.toObject(),
          createdBy: userInfo ? { _id: userInfo._id, fullName: userInfo.fullName } : "Unknown",
          updatedBy: updatedUserInfo ? { _id: updatedUserInfo._id, fullName: updatedUserInfo.fullName } : 'Unknown'
        };
      })
    );

    return res.status(200).json(roomsWithUserDetails);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch rooms",
      success: false,
    });
  }
};


// get room by id 
export const getRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await RoomId.findById(id);
    if (!room) {
      return res.status(202).json({ error: "Room not found" });
    }

    const userInfo = await user.findOne({ _id: room.createdBy })

    if (!userInfo) {
      return res.status(500).json({ error: "User not found" });
    }


    const updatedUserInfo = await user.findOne({ _id: room.updatedBy })

    if (!updatedUserInfo) {
      return res.status(500).json({ error: "Updated User not found" });
    }

    // Count the number of transactions for this room
    const transactionCount = await Transaction.countDocuments({ roomId: room.roomUuid });

    // Calculate the number of slots left
    const slotsLeft = room.availableSlots - transactionCount;

    // Create a new room object with the desired format
    const formattedRoom = {
      ...room.toObject(),
      createdBy: {
        _id: userInfo._id,
        fullName: userInfo ? userInfo.fullName : "Unknown",
      },
      updatedBy: {
        _id: updatedUserInfo._id,
        fullName: updatedUserInfo ? updatedUserInfo.fullName : 'Unknown',
      },
      slotsLeft
    };

    return res.status(200).json({ room: formattedRoom });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch room",
      success: false,
    });
  }
};


// Update a room by ID
export const updateRoomById = async (req: Request, res: Response) => {
  try {
    const roomId = req.params.id;
    const updatedRoomData = req.body;
    const file = req.file;

    const user = req.user as userType;
    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }
    const userId = user.userId;

    let secure_url: string | null = null;
    if (file) {
      const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(
        file.path
      );
      secure_url = uploadResponse.secure_url;
    }
    updatedRoomData.mapImg = secure_url;

    if (!roomId) {
      return res.status(400).json({ message: "Room ID is required" });
    }

    const existingRoom = await RoomId.findById(roomId);

    if (!existingRoom) {
      return res.status(202).json({ message: "Room not found" });
    }

    // If updatedBy field doesn't exist in updatedRoomData, initialize it
    if (!updatedRoomData.updatedBy) {
      updatedRoomData.updatedBy = '';
    }

    // Append the current user's ID to the updatedBy string
    updatedRoomData.updatedBy = updatedRoomData.updatedBy ? `${updatedRoomData.updatedBy},${userId}` : userId;

    // Update the room data
    await RoomId.findByIdAndUpdate(roomId, updatedRoomData, { new: true });

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
      return res.status(202).json({ error: "Room not found" });
    }
    res.status(200).json({ message: "Room deleted successfully" });
  } catch (error) {
    return res.status(500).json({ error: "Failed to delete room" });
  }
};


// get all room that created by only that perticular role user
export const getUserRooms = async (req: Request, res: Response) => {
  try {
    // Define req.user before accessing its properties
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;
    const { sortingKey } = req.query;

    // Fetch rooms associated with the specific user
    const userRooms = await RoomId.find({
      $or: [
        { createdBy: userId },
        { assignTo: userId }
      ]
    });

    // Sort the rooms by createdAt based on the 'latestFirst' and 'previousFirst' keys
    let sortedRooms = userRooms;
    if (sortingKey === 'latestFirst') {
      sortedRooms = userRooms.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    } else if (sortingKey === 'previousFirst') {
      sortedRooms = userRooms.sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime());
    }


    return res.status(200).json(userRooms);
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch user rooms",
      success: false,
    });
  }
};


// get all team in a room
export const getAllTeamDetailsInARoom = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await RoomId.findById({ _id: id });

    if (!room) {
      return res.status(404).json({ message: 'No teams found for the given roomId.' });
    }

    const teams = room.registerTeams.map((team: { teamName: any; }) => ({
      teamName: team.teamName
    }));

    return res.status(200).json({ teams: teams });
  } catch (error) {
    console.error('Error: ', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}