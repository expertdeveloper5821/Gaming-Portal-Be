import { user } from "../models/userModel";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { transporter } from "../middlewares/email";
import { generateOTP } from "../utils/otpGen";

// for user signup
export const userSignup = async (req: Request, res: Response) => {
  try {
    const { fullName, userName, email, password } = req.body;
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: `user with email ${email} already exists`,
      });
    }
    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new user({
      fullName,
      userName,
      email,
      password: hashedPassword,
    });
    // saving the user to DB
    await newUser.save();
    // generating a jwt token to specifically identify the user
    const token = jwt.sign(
      { userId: newUser._id },
      process.env.jwtSecret || ""
    );
    return res.status(200).json({
      token,
      code: 200,
      message: "user registered successfully",
    });
  } catch (error) {
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// for user login
export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const User = await user.findOne({ email });
    if (!User) {
      return res.status(400).json({
        code: 400,
        message: `user with email ${email} does not exist`,
      });
    }
    const isPasswordValid = await bcrypt.compare(password, User.password);

    if (!isPasswordValid) {
      return res.status(401).json({ code: 401, message: "Invalid password" });
    }
    const token = jwt.sign({ userId: User._id }, process.env.jwtSecret || "", {
      expiresIn: "48h",
    });
    return res.status(200).json({
      token,
      code: 200,
      message: "user Login successfully",
    });
  } catch (error) {
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// to forget password
export const forgetPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  try {
    // Check if email exists in the database
    const User = await user.findOne({ email });
    if (!User) {
      return res
        .status(400)
        .json({ code: 400, message: `Account with email ${email} not found` });
    }

    // setting expiration time of 10 min
    const otp = generateOTP();
    const expirationTime = new Date(Date.now() + 600000);

    // Create the JWT
    const expiresIn = "1h";
    const token = jwt.sign(
      { email, expirationTime, otp },
      process.env.jwtSecret as string,
      {
        expiresIn,
      }
    );
    const mailOptions = {
      from: process.env.emailUser,
      to: email,
      subject: "Password Reset OTP",
      text: `Your OTP for reset password  is ${otp}`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        res.status(500).json({ code: 500, message: "Failed to send OTP" });
      } else {
        res.json({ code: 200, token: token, message: "OTP sent successfully" });
      }
    });
  } catch (error) {
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// to reset password
export const resetPassword = async (req: Request, res: Response) => {
  const { token, otp, newPassword } = req.body;
  try {
    const decodedToken = jwt.verify(
      token,
      process.env.jwtSecret as string
    ) as jwt.JwtPayload;
    const nowInSeconds = Math.floor(Date.now() / 1000);

    if (!decodedToken) {
      return res
        .status(400)
        .json({ code: 400, message: "Invaliddddddddddddd or expired OTP" });
    }
    const { expirationTime } = decodedToken;
    if (new Date() > expirationTime) {
      return res
        .status(400)
        .json({ code: 400, message: "Invalid or expired OTP" });
    }
    if (otp !== decodedToken.otp) {
      return res.status(400).json({ code: 400, message: "Invalid OTP" });
    }

    // Check if the token is expired
    if (decodedToken.exp && decodedToken.exp < nowInSeconds) {
      return res.status(400).json({ code: 400, message: "Expired" });
    }
    const { email } = decodedToken;
    const User = await user.findOne({ email });
    if (!User) {
      return res.status(400).json({ code: 400, message: "User not found" });
    }
    // Set the new password
    if (User) {
      if (!newPassword) {
        return res
          .status(400)
          .json({ code: 400, message: "New password is required" });
      }
      const hashedPassword = await bcrypt.hash(newPassword, 10);
      User.password = hashedPassword;
      await User.save();
    }
    return res.json({ code: 200, message: "Password reset successful" });
  } catch (error) {
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};
