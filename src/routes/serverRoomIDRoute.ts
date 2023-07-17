import express from "express";
import { createRoom, getAllRooms, getRoomById, updateRoomById, deleteRoomById } from "../controllers/serverRoomIDController";


const router = express.Router();

router.post("/rooms", createRoom);
router.get("/rooms", getAllRooms);
router.get("/rooms/:id", getRoomById);
router.put("/rooms/:id", updateRoomById);
router.delete("/rooms/:id", deleteRoomById);

export default router;
