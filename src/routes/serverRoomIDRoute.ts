import express from "express";
import { createRoom, getAllRooms, getRoomById, updateRoomById, deleteRoomById, getUserRooms } from "../controllers/serverRoomIDController";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();

// room creating 
router.post("/rooms", verifyToken(['spectator','admin']),createRoom);

// get room
router.get("/rooms", getAllRooms);

// get rooms by id 
router.get("/rooms/:id", verifyToken(['spectator', 'user','admin']),getRoomById);

// update room by id 
router.put("/rooms/:id", verifyToken(['spectator','admin']),updateRoomById);

// delete room by id 
router.delete("/rooms/:id", verifyToken(['spectator','admin']),deleteRoomById);

// Fetch rooms created by a specific user
router.get("/user-rooms", verifyToken(['spectator']), getUserRooms);

export default router;
