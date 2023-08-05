import { Request, Response } from "express";
import RoomId from "../models/serverRoomIDModels";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";


// Create a new room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { gameName, gameType, mapType, password } = req.body;

    if (!gameName || !gameType || !mapType || !password) {
      return res.status(400).json({ message: "All fields required" });
    } else {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }

      const secretKey = environmentConfig.JWT_SECRET;

      try {
        const decoded: any = jwt.verify(token, secretKey);
        const userId = decoded.userId;

        const newUuid = uuidv4();

        await RoomId.create({
          uuid: newUuid,
          gameName,
          gameType,
          mapType,
          password,
          createdBy: userId,
        });

        return res.status(200).json({
          message: "Room created successfully",
          uuid: newUuid,
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
    return res.status(200).json(rooms);
  } catch (error) {
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
    return res.status(200).json(room);
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
