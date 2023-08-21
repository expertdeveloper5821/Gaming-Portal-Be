import express from "express";
import { createRoom, getAllRooms, getRoomById, updateRoomById, deleteRoomById, getUserRooms} from "../controllers/serverRoomIDController";
import { verifyToken } from "../middlewares/authMiddleware";
import multer from 'multer';
import bodyParser from "body-parser";


const router = express.Router();


router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));


const storage = multer.diskStorage({
    filename: (req, file, cb) => {
        const name = Date.now() + '_' + file.originalname;
        cb(null, name); 
    }
});

const upload = multer({ storage: storage });



// room creating 
router.post("/rooms", upload.single('mapImg'), verifyToken(['spectator','admin']),createRoom);

// get room
router.get("/rooms", getAllRooms);


// get rooms by id 
router.get("/rooms/:id", verifyToken(['spectator', 'user','admin']),getRoomById);

// update room by id 
router.put("/rooms/:id", upload.single('mapImg'), verifyToken(['spectator','admin']),updateRoomById);

// delete room by id 
router.delete("/rooms/:id", verifyToken(['spectator','admin']),deleteRoomById);

// Fetch rooms created by a specific user
router.get("/user-rooms", verifyToken(['spectator']), getUserRooms);

export default router;
