import express from "express";
import multer from 'multer';
import path from "path";
import bodyParser from "body-parser";
import { createQrCodeImage, getqrCodeById, createPayment, getpaymentdeatilsById } from "../controllers/qrCodeController";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();

router.use(bodyParser.json());
router.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from the 'public' directory
router.use(express.static('public'));

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/qrCodeImage')); 
    },
    filename: (req, file, cb) => {
        const name = Date.now() + '_' + file.originalname;
        cb(null, name); 
    }
});

const upload = multer({ storage: storage });

// Uploading QR code image 
router.post("/qrCode", upload.single('qrCodeImg'),  createQrCodeImage);

// Get QR code
router.get("/qrCode/:id", getqrCodeById);

// creating payment - Only 'user' token is allowed
router.post("/create-payment", verifyToken(['user', 'spectator', 'admin']), createPayment);

// get payment by id - Only 'user, spectator' token is allowed
router.get("/get-payment/:id", verifyToken(['user', 'spectator', 'admin']), getpaymentdeatilsById);


export default router;
