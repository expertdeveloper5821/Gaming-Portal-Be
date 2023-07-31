import { user } from "../models/passportModels";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { transporter } from "../middlewares/email";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import { Role } from "../models/roleModel";


// for admin signup
export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { fullName, userName, email, password, role } = req.body;
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
      role,
    });
    // saving the user to DB
    await newUser.save();
    // generating a jwt token to specifically identify the user
    const token = jwt.sign(
      { userId: newUser._id },
      environmentConfig.JWT_SECRET
    );
    return res.status(200).json({
      newUser,
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
    const { fullName, userName, email, password, role } = req.body;
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
      role,
    });
    // saving the user to DB
    await newUser.save();
    // generating a jwt token to specifically identify the user
    const token = jwt.sign(
      { userId: newUser._id },
      environmentConfig.JWT_SECRET
    );
    // Send the reset password URL in the email
    const mailOptions = {
      from: environmentConfig.EMAIL_USER,
      to: email,
      subject: "Spectator Credentials",
      text: `These are the Spectator Credentials Please Do not share with anyone  email ${email} password ${password}`,
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        res.status(500).json({
          code: 500,
          message: "Failed to send the credential email",
        });
      } else {
        res.json({
          newUser,
          code: 200,
          tokne: token,
          message:
            "Your login crendentials has been sent ot your email please check and continue",
        });
      }
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
}

// create Role
export const role = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    // hashing the password
    const newRole = new Role({
      role,
    });
    // saving the user to DB
    await newRole.save();
    // generating a jwt token to specifically identify the user
    return res.status(200).json({
      newRole,
      code: 200,
      message: `${role} role created successfully`,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// get all role
export const getAllRole = async (req: Request, res: Response) => {
  try {
    // Use the find method without any conditions to retrieve all users from the database
    const allRoles = await Role.find();

    if (allRoles.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "No Role found",
      });
    }

    // If users are found, return the user data as the response
    return res.status(200).json({
      code: 200,
      data: allRoles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// get Role by Id
export const getRoleById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = await user.findById(id).populate("role", "role");
    if (!role) {
      return res.status(404).json({ error: "role not found" });
    }
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch role" });
  }
};
