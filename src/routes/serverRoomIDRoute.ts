import express from "express";
import { createRoom, getAllRooms, getRoomById, updateRoomById, deleteRoomById } from "../controllers/serverRoomIDController";
import { verifyToken } from "../middlewares/authMiddleware";
import multer from 'multer';
import path from "path";
import bodyParser from "body-parser";


const router = express.Router();


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
router.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/mapImage')); 
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '_' + file.originalname;
        cb(null, name); 
    }
});

const upload = multer({ storage: storage });



// room creating 
router.post("/rooms", upload.single('mapImg'), verifyToken(['spectator','admin']),createRoom);

// get room
router.get("/rooms", verifyToken(['spectator', 'user', 'admin']),getAllRooms);

// get rooms by id 
router.get("/rooms/:id", verifyToken(['spectator', 'user','admin']),getRoomById);

// update room by id 
router.put("/rooms/:id", verifyToken(['spectator','admin']),updateRoomById);

// delete room by id 
router.delete("/rooms/:id", verifyToken(['spectator','admin']),deleteRoomById);

export default router;
