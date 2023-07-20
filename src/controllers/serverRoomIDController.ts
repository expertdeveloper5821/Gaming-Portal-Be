import { Request, Response } from "express";
import RoomId from "../models/serverRoomIDModels";

// Create a new room
export const createRoom = async (req: Request, res: Response) => {
  try {
    const { roomId, gameName, gameType, mapType} = req.body;
    if (!roomId || !gameName || !gameType || ! mapType) {
      return res.status(400).json({ message: "All fields required" });
    } else {
      const createdRoom = await RoomId.create({ roomId, gameName, gameType, mapType });
      return res.status(200).json({
        message: "RoomID created successfully",
        roomId: createdRoom.roomId,
        gameName: createdRoom.gameName,
        gameType: createdRoom.gameType,
        mapType: createdRoom.mapType
      });
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
