"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const serverRoomIDController_1 = require("../controllers/serverRoomIDController");
const router = express_1.default.Router();
router.post("/rooms", serverRoomIDController_1.createRoom);
router.get("/rooms", serverRoomIDController_1.getAllRooms);
router.get("/rooms/:id", serverRoomIDController_1.getRoomById);
router.put("/rooms/:id", serverRoomIDController_1.updateRoomById);
router.delete("/rooms/:id", serverRoomIDController_1.deleteRoomById);
exports.default = router;
