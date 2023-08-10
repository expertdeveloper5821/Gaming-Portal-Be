import express from "express";
import { createRoom, getAllRooms, getRoomById, updateRoomById, deleteRoomById } from "../controllers/serverRoomIDController";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();

// room creating - Only 'spectator' token is allowed
router.post("/rooms", verifyToken(['spectator']),createRoom);

// get rooms - Only 'spectator' token is allowed
router.get("/rooms", verifyToken(['spectator', 'user']),getAllRooms);

// get rooms by id - Only 'spectator' token is allowed
router.get("/rooms/:id", verifyToken(['spectator', 'user']),getRoomById);

// update room by id - Only 'spectator' token is allowed
router.put("/rooms/:id", verifyToken(['spectator']),updateRoomById);

// delete room by id - Only 'spectator' token is allowed
router.delete("/rooms/:id", verifyToken(['spectator']),deleteRoomById);

export default router;
