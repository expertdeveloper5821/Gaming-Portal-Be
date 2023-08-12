import { Request, Response } from "express";
import RoomId from "../models/serverRoomIDModels";
import { v4 as uuidv4 } from "uuid";
import fs from "fs";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import { user } from "../models/passportModels";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";


// Configuration
cloudinary.config({
  cloud_name: environmentConfig.CLOUD_NAME,
  api_key: environmentConfig.API_KEY,
  api_secret: environmentConfig.API_SECRET
});


// Create a new room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, gameName, gameType, mapType, password, version, time, date } = req.body;
    const file = req.file;

    if (!roomId || !gameName || !gameType || !mapType || !password || !version || !time || !date) {
      return res.status(400).json({ message: "All fields required" });
    } else {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const secretKey = environmentConfig.JWT_SECRET;
      
      if (!file) {
        return res.status(400).json({ message: "File not provided" });
      }
      
      const tempPath = file.path;

      try {
        const decoded: any = jwt.verify(token, secretKey);
        const userId = decoded.userId;
        const newUuid = uuidv4();
        
        const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(tempPath, {
            folder: "mapImage",
        });
        const secure_url: string = uploadResponse.secure_url;

        const createdRoom = await RoomId.create({
          uuid: newUuid,
          roomId,
          gameName,
          gameType,
          mapType,
          password,
          mapImg: secure_url,
          version,
          createdBy: userId,
          time,
          date
        });

        fs.unlinkSync(tempPath);

        return res.status(200).json({
          message: "Room created successfully",
          uuid: newUuid,
          _id: createdRoom._id, // Include the created room's ObjectId in the response
        });
      } catch (error) {
        console.error(error);
        return res.status(401).json({ message: "Invalid token" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to create room",
      success: false,
    });
  }
};

// Get all rooms
export const getAllRooms = async (req: Request, res: Response) => {
  try {
    const rooms = await RoomId.find();

    const roomsWithUserDetails = await Promise.all(
      rooms.map(async (room) => {
        const userInfo = await user.findOne({ _id: room.createdBy });
        return {
          rooms,
          // Add other room properties you want to include
          createdBy: userInfo ? userInfo.fullName : "Unknown",
        };
      })
    );
    return res.status(200).json(roomsWithUserDetails);
  }  catch (error) {
    return res.status(500).json({ error: "Failed to fetch rooms" });
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

    const userInfo = await user.findOne({_id:room.createdBy })

    if(!userInfo){
      return res.status(500).json({ error: "User not found" });
    }
    return res.status(200).json({room, fullName: userInfo.fullName });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch room" });
  }
};

// Update a room by ID
export const updateRoomById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const roomDets = req.body;

    // Find the room by ID and update it
    const updatedRoom = await RoomId.findByIdAndUpdate(
      id,
      { $set: roomDets },
      { new: true }
    );

    if (!updatedRoom) {
      return res.status(404).json({
        error: "Room not found",
        success: false,
      });
    }

    return res.status(200).json({
      message: "Room updated successfully.",
      success: true,
      room: updatedRoom,
    });
  } catch (error) {
    return res.status(500).json({ error: "Failed to update room" });
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