import { user } from "../models/passportModels";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { transporter } from "../middlewares/email";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import { Role } from "../models/roleModel";
import { validId } from "../utils/pattern";
import Video from "../models/ytVideo";

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
};

// create Role
export const role = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const existingRole = await Role.findOne({ role });
    if (existingRole) {
      return res.status(400).json({
        code: 400,
        message: `This ${role} role already exists please try with a new Role`,
      });
    }
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
    if (!validId.test(id)) {
      return res.status(404).json({ error: "Invalid role ID" });
    }
    const role = await user.findById(id).populate("role", "role");
    if (!role) {
      return res.status(404).json({ error: "role not found" });
    }
    return res.status(200).json(role);
  } catch (error) {
    return res.status(500).json({ error: "Failed to fetch role" });
  }
};

// Update role by ID
export const updateRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { roleid } = req.body;
    if (!validId.test(id)) {
      return res.status(404).json({ error: "Invalid role ID" });
    }
    if (!validId.test(roleid)) {
      return res
        .status(404)
        .json({ error: "provided role ID is of invalid format" });
    }
    // Check if the specified role exists before updating
    const existingRole = await Role.findById(roleid);
    if (!existingRole) {
      return res.status(400).json({ error: "Role does not exist" });
    }

    // Find the user by ID and update the 'role' field with the specified role ID
    const updatedUser = await user.findByIdAndUpdate(
      id,
      { role: roleid }, // Update the 'role' field with the new role ID
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json(updatedUser);
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// Delete role by ID
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!validId.test(id)) {
      return res.status(404).json({ error: "Invalid role ID" });
    }
    const deletedRole = await user.findByIdAndDelete(id);
    if (!deletedRole) {
      return res.status(404).json({ error: "Role not found" });
    }
    // await user.updateMany({ role: id }, { $pull: { role: id } });
    return res.status(200).json({ message: "deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// youtube video link
export const video = async (req: Request, res: Response) => {
  try {
    const { videoLink, date, time } = req.body;
    if (!videoLink || !date || !time ) {
      return res.status(400).json({ message: "All fields required" });
    }
    const existingVideo = await Video.findOne({ videoLink });
    if (existingVideo) {
      return res.status(400).json({
        code: 400,
        message: `same video already exists`,
      });
    }
    // Create a new video document and save it to the database
    const newVideo = new Video({ videoLink, date, time });
    await newVideo.save();
    res
      .status(200)
      .json({ code: 200, message: "Video link saved successfully" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// get all video links
export const getAllVideoLink = async (req: Request, res: Response) => {
  try {
    // Use the find method without any conditions to retrieve all users from the database
    const allVideos = await Video.find();
    if (allVideos.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "No video link ",
      });
    }
    // If video links are found, return the data as the response
    return res.status(200).json({
      code: 200,
      data: allVideos,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};
// get video by ID
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!validId.test(id)) {
      return res.status(404).json({ error: "Invalid ID" });
    }
    const video = await Video.findById(id);
    if (!video) {
      return res.status(404).json({ code: 404, message: 'Video not found' });
    }
    res.status(200).json({ code: 200, video });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, error: 'Internal server error' });
  }
};

//update video by ID
export const updateVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!validId.test(id)) {
      return res.status(404).json({ error: "Invalid ID" });
    }
    const { videoLink, date, time } = req.body;
    const updatedVideo = await Video.findByIdAndUpdate(id, { videoLink, date, time }, { new: true });
    if (!updatedVideo) {
      return res.status(404).json({ code: 404, message: 'Video not found' });
    }
    res.status(200).json({ code: 200, message: 'Video updated successfully', video: updatedVideo });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, error: 'Internal server error' });
  }
};

// delete video by ID
export const deleteVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    if (!validId.test(id)) {
      return res.status(404).json({ error: "Invalid ID" });
    }
    const deletedVideo = await Video.findByIdAndDelete(id);
    if (!deletedVideo) {
      return res.status(404).json({ code: 404, message: 'Video not found' });
    }
    res.status(200).json({ code: 200, message: 'Video deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, error: 'Internal server error' });
  }
};
