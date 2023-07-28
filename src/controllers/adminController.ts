import { user } from "../models/userModel";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import {Role} from '../models/roleModel'
// for admin signup
export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { fullName, userName, email, password  , role} = req.body;
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
      role
    });
    // saving the user to DB
    await newUser.save();
    // generating a jwt token to specifically identify the user
    const token = jwt.sign(
      { userId: newUser._id },
      environmentConfig.JWT_SECRET
    );
    return res.status(200).json({
      token,
      code: 200,
      message: "user registered successfully",
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// speactator post request 
export const spectator = async (req: Request, res: Response) => {
    try {
      const { fullName, userName, email, password  , role} = req.body;
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
        role
      });
      // saving the user to DB
      await newUser.save();
      // generating a jwt token to specifically identify the user
      const token = jwt.sign(
        { userId: newUser._id },
        environmentConfig.JWT_SECRET
      );
      return res.status(200).json({
        token,
        code: 200,
        message: "user registered successfully",
      });
    } catch (error) {
      console.log(error);
  
      return res.status(500).json({ code: 500, error: "Internal server error" });
    }
  };

export const role = async (req: Request, res: Response) => {
    try {
      const {role} = req.body;
      // hashing the password
      const newRole = new Role({
        role
      });
      // saving the user to DB
      await newRole.save();
      // generating a jwt token to specifically identify the user
      return res.status(200).json({
        code: 200,
        message: `${role} role created successfully`,
      });
    } catch (error) {
      console.log(error);
  
      return res.status(500).json({ code: 500, error: "Internal server error" });
    }
  };
  

  export const getRoleById = async (req: Request, res: Response) => {
    try {
      const {id } = req.params;
      const role = await user.findById(id).populate('role','role');
      if (!role) {

        return res.status(404).json({ error: "role not found" });
      }
      return res.status(200).json(role);
    } catch (error) {
      return res.status(500).json({ error: "Failed to fetch role" });
    }
  };

