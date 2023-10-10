import { Request, Response } from "express";
import { QrCodeImg, Transaction } from "../models/qrCodeModel";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";
import { v4 as uuidv4 } from "uuid";
import { environmentConfig } from "../config/environmentConfig";
import jwt from "jsonwebtoken";
import { user } from "../models/passportModels";
import RoomId from "../models/serverRoomIDModels";
import { userType } from "../middlewares/authMiddleware";
import { Team } from "../models/teamModel";

// Configuration
cloudinary.config({
  cloud_name: environmentConfig.CLOUD_NAME,
  api_key: environmentConfig.API_KEY,
  api_secret: environmentConfig.API_SECRET
});


// Create a new QrCodeImage
export const createQrCodeImage = async (req: Request, res: Response): Promise<void> => {
  try {
    const file = req.file;
    if (!file) {
      res.status(400).json({ message: "Image field is required" });
      return;
    }

    const { path: tempPath } = file;

    // Upload the Image to Cloudinary
    const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(tempPath);
    const secure_url: string = uploadResponse.secure_url;
    const newUuid = uuidv4();

    // Create the qrCode document
    const doc = new QrCodeImg({
      qrCodeImg: secure_url,
      uuid: newUuid,
    });

    // Save the qrCode document
    const qrCodeSave = await doc.save();
    if (qrCodeSave._id) {
      res.status(200).json({
        _id: qrCodeSave._id,
        qrCodeImg: secure_url,
        uuid: newUuid,
      });
    } else {
      res.status(400).json({ error: "Error saving QR code Image" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      error: "Failed to upload QR code image",
      success: false,
    });
  }
};


// Get a single QrCodeImage by ID
export const getqrCodeById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const room = await QrCodeImg.findById(id);
    if (!room) {
      return res.status(404).json({ error: "qrCode Image not found" });
    }
    return res.status(200).json(room);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch qrCode Image" });
  }
};


// post payment details by user
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { upiId, matchAmount, name, id, roomid } = req.body;

    const qrCodeData = await QrCodeImg.findOne({ uuid: id });
    const roomdata = await RoomId.findOne({ roomUuid: roomid });

    if (!upiId || !matchAmount || !name) {
      return res.status(400).json({ message: "All fields required" });
    } else {
      const user = req.user as userType;

      if (!user) {
        return res.status(401).json({ message: 'You are not authenticated!', success: false });
      }

      const userId = user.userId;

      if (qrCodeData && roomdata) {
        // Check if all slots are full
        const transactionCount = await Transaction.countDocuments({ roomId: roomdata.roomUuid });
        if (transactionCount >= roomdata.availableSlots) {
          return res.status(400).json({ message: "All slots are full in this room" });
        }

        // Check if the user has already made a payment for the specified room
        const existingTransaction = await Transaction.findOne({
          paymentBy: userId,
          roomId: roomdata.roomUuid,
        });

        if (existingTransaction) {
          return res.status(400).json({
            message: "You have already register in this room",
          });
        }

        const newTransaction = await Transaction.create({
          upiId,
          matchAmount,
          name,
          paymentBy: userId,
          uuid: qrCodeData?.uuid,
          roomId: roomdata?.roomUuid,
        });

        // Update the Team model with the roomId for the user's team
        const userTeam = await Team.findOne({ leadPlayerId: userId });
        if (userTeam) {
          // Check if the roomId is not already in the array
          if (!userTeam.roomUuid.includes(roomdata?.roomUuid)) {
            userTeam.roomUuid.push(roomdata?.roomUuid); // Add the new roomId to the array
            await userTeam.save();
          }
        }

        return res.status(200).json({
          message: "Payment successfully",
          _id: newTransaction._id,
          upiId,
          matchAmount,
          name,
          paymentBy: userId,
          uuid: qrCodeData?.uuid,
          roomId: roomdata?.roomUuid,
        });
      } else {
        return res.status(401).json({ message: "uuid or roomid not found" });
      }
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to initiate payment",
      success: false,
    });
  }
};

// Get a single payment details by ID
export const getpaymentdeatilsById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const payment = await Transaction.findById(id);
    if (!payment) {
      return res.status(404).json({ error: "Payment history not found" });
    }

    const userInfo = await user.findOne({ _id: payment.paymentBy })

    if (!userInfo) {
      return res.status(500).json({ error: "User not found" });
    }

    return res.status(200).json({ payment, fullName: userInfo.fullName });
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch Payment history" });
  }
};