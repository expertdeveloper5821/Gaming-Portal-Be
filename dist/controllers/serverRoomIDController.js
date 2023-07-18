"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteRoomById = exports.updateRoomById = exports.getRoomById = exports.getAllRooms = exports.createRoom = void 0;
const serverRoomIDModels_1 = __importDefault(require("../models/serverRoomIDModels"));
// Create a new room
const createRoom = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { roomId, gameName, gameType } = req.body;
        if (!roomId || !gameName || !gameType) {
            return res.status(400).json({ message: "All fields required" });
        }
        else {
            const createdRoom = yield serverRoomIDModels_1.default.create({ roomId, gameName, gameType });
            return res.status(200).json({
                message: "RoomID created successfully",
                roomId: createdRoom.roomId,
                gameName: createdRoom.gameName,
                gameType: createdRoom.gameType
            });
        }
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create room",
            success: false,
        });
    }
});
exports.createRoom = createRoom;
// Get all rooms
const getAllRooms = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const rooms = yield serverRoomIDModels_1.default.find();
        return res.status(200).json(rooms);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch rooms" });
    }
});
exports.getAllRooms = getAllRooms;
// Get a single room by ID
const getRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const room = yield serverRoomIDModels_1.default.findById(id);
        if (!room) {
            return res.status(404).json({ error: "Room not found" });
        }
        return res.status(200).json(room);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch room" });
    }
});
exports.getRoomById = getRoomById;
// Update a room by ID
const updateRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const roomDets = req.body;
        // Find the room by ID and update it
        const updatedRoom = yield serverRoomIDModels_1.default.findByIdAndUpdate(id, { $set: roomDets }, { new: true });
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
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to update room" });
    }
});
exports.updateRoomById = updateRoomById;
// Delete a room by ID
const deleteRoomById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const deletedRoom = yield serverRoomIDModels_1.default.findByIdAndDelete(id);
        if (!deletedRoom) {
            return res.status(404).json({ error: "Room not found" });
        }
        res.status(200).json({ message: "Room deleted successfully" });
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to delete room" });
    }
});
exports.deleteRoomById = deleteRoomById;
