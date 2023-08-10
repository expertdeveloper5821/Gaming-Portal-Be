import { instance } from "../app";
import { Request, Response } from "express";
import crypto from "crypto";
import { Payment } from "../models/paymentModel";
import { environmentConfig } from "../config/environmentConfig";
import jwt from "jsonwebtoken";
import { v4 as uuidv4 } from "uuid";

const razorPaySecret: string = environmentConfig.RAZORPAY_APT_SECRET;

// payment created
export const checkout = async (req: Request, res: Response) => {
    try {
        const options = {
            amount: Number(req.body.amount * 100),
            currency: "INR",
        };
        const order = await instance.orders.create(options);

        res.status(200).json({
            success: true,
            order
        });
    } catch (err) {
        console.error("Error in checkout:", err);
        res.status(500).json({ 
            success: false,
            message: "Error in checkout",
        });
    }
};

// Adjust the type if your user ID is not a string
interface JwtPayload {
    userId: string; 
  }

//   payment verifications
  export const paymentVerification = async (req: Request, res: Response) => {
    try {
      const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
        req.body;
  
      const body = razorpay_order_id + "|" + razorpay_payment_id;
  
      const expectedSignature = crypto
        .createHmac("sha256", razorPaySecret)
        .update(body.toString())
        .digest("hex");
  
      const isAuthentic = expectedSignature === razorpay_signature;
  
      if (isAuthentic) {
        const token = req.header("Authorization")?.replace("Bearer ", "");
        if (!token) {
          return res
            .status(401)
            .json({ success: false, message: "Unauthorized" });
        }
  
        const secretKey: string = environmentConfig.JWT_SECRET;
        const decoded = jwt.verify(token, secretKey) as JwtPayload;
        const userId = decoded.userId;
  
        const newUuid = uuidv4();
  
        await Payment.create({
          razorpay_order_id,
          razorpay_payment_id,
          razorpay_signature,
          createdBy: userId,
          uuid: newUuid,
        });
  
        return res.status(200).json({
          message: "Payment success",
          uuid: newUuid,
        });
      } else {
        res.status(400).json({
          success: false,
        });
      }
    } catch (err) {
      console.error("Error in paymentVerification:", err);
      res.status(500).json({
        success: false,
        message: "Error in payment verification",
      });
    }
  };
