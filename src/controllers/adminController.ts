import { user } from "../models/passportModels";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { transporter } from "../middlewares/email";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import { Role } from "../models/roleModel";
import { validId } from "../utils/pattern";
import Video from "../models/ytVideo";
import { v4 as uuidv4 } from "uuid";
import moment from 'moment-timezone';
import { userType } from '../middlewares/authMiddleware';
import RoomId from "../models/serverRoomIDModels";
import { passwordRegex, emailValidate } from "../utils/helper";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";


// Configuration
cloudinary.config({
  cloud_name: environmentConfig.CLOUD_NAME,
  api_key: environmentConfig.API_KEY,
  api_secret: environmentConfig.API_SECRET
});


// for admin signup
export const adminSignup = async (req: Request, res: Response) => {
  try {
    const { fullName, userName, email, password, role } = req.body;
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: `user with email ${email} already exists`,
      });
    }
    // Email validation check using regex pattern
    if (!emailValidate(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Password validation check
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one Upper letter, one digit, one special character (!@#$%^&*()_+)",
      });
    }
    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUuid = uuidv4();
    const newUser = new user({
      fullName,
      userName,
      email,
      password: hashedPassword,
      role,
      userUuid: newUuid,
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
      message: "user registered successfully",
      userUuid: newUuid,
      _id: newUser._id
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Internal server error" });
  }
};

// speactator post request
export const spectator = async (req: Request, res: Response) => {
  try {
    const { fullName, userName, email, password, role } = req.body;
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: `user with email ${email} already exists`,
      });
    }
    // Email validation check using regex pattern
    if (!emailValidate(email)) {
      return res.status(400).json({
        message: "Invalid email format",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters long",
      });
    }

    // Password validation check
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        message:
          "Password must contain at least one Upper letter, one digit, one special character (!@#$%^&*()_+)",
      });
    }
    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);
    const newUuid = uuidv4();
    const newUser = new user({
      fullName,
      userName,
      email,
      password: hashedPassword,
      role,
      userUuid: newUuid,
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
          message: "Failed to send the credential email",
        });
      } else {
        res.json({
          newUser,
          tokne: token,
          message:
            "Your login crendentials has been sent ot your email please check and continue",
        });
      }
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Internal server error" });
  }
};

// create Role
export const role = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    const existingRole = await Role.findOne({ role });
    if (existingRole) {
      return res.status(400).json({
        message: `This ${role} role already exists please try with a new Role`,
      });
    }
    const newUuid = uuidv4();
    // hashing the password
    const newRole = new Role({
      role,
      uuid: newUuid,

    });
    // saving the user to DB
    await newRole.save();
    // generating a jwt token to specifically identify the user
    return res.status(200).json({
      newRole,
      message: `${role} role created successfully`,
    });
  } catch (error) {
    console.log(error);

    return res.status(500).json({ error: "Internal server error" });
  }
};

// get all role
export const getAllRole = async (req: Request, res: Response) => {
  try {
    // Use the find method without any conditions to retrieve all users from the database
    const allRoles = await Role.find();

    if (allRoles.length === 0) {
      return res.status(404).json({
        message: "No Role found",
      });
    }

    // If users are found, return the user data as the response
    return res.status(200).json({
      data: allRoles,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
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
    const { userUuid } = req.params;
    const updatedData = req.body;

    // Find the user by UUID and update their information
    const updatedUser = await user.findOneAndUpdate({ userUuid }, updatedData, { new: true });

    if (!updatedUser) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.status(200).json({ message: "User updated successfully", user: updatedUser });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Delete role by ID
export const deleteRole = async (req: Request, res: Response) => {
  try {
    const { userUuid } = req.params;
    const deletedUser = await user.findOneAndDelete({ userUuid });
    if (!deletedUser) {
      return res.status(404).json({ error: "User not found" });
    }
    return res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// youtube video link
export const video = async (req: Request, res: Response) => {
  try {
    // Extract the user ID from the request
    const user = req.user as userType; // Type assertion to userType
    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }
    const userId = user.userId;

    const { title, videoLink, dateAndTime } = req.body;
    const file = req.file;
    const { roomId } = req.params
    // Check for required fields
    const requiredFields = ['title', 'videoLink', 'dateAndTime'];
    const missingFields = requiredFields.filter(field => !req.body[field]);

    if (missingFields.length > 0) {
      const missingFieldsMessage = missingFields.join(', ');
      return res.status(400).json({ message: `${missingFieldsMessage} field is required` });
    }

    const existingVideo = await Video.findOne({ videoLink });
    if (existingVideo) {
      return res.status(400).json({
        message: `same video already exists`,
      });
    }

    let secure_url: string | null = null;
    if (file) {
      const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(
        file.path
      );
      secure_url = uploadResponse.secure_url;
    }

    const checkRoomUuid = await RoomId.findOne({ roomUuid: roomId })
    if (!checkRoomUuid) {
      return res.status(202).json({ message: 'Room not found' });
    } else {
      // Parse date and time into Date objects
      const parsedDateAndTime = moment(dateAndTime).tz('Asia/Kolkata');

      if (!parsedDateAndTime.isValid()) {
        return res.status(400).json({ message: 'Invalid date or time format' });
      }
      // Create a new video document and save it to the database
      const newVideo = new Video({ roomId: checkRoomUuid.roomUuid, title, videoLink, dateAndTime, mapImg: secure_url, createdBy: userId });
      await newVideo.save();
      return res.status(200).json({ message: "Video link saved successfully", newVideo });
    }
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get all video links
export const getAllVideoLink = async (req: Request, res: Response) => {
  try {
    // Use the find method without any conditions to retrieve all videos from the database 
    const allVideos = await Video.find().sort({ createdAt: -1 }); // Sort by createdAt in descending order

    if (allVideos.length === 0) {
      return res.status(404).json({
        message: "No video found",
      });
    }

    // Create an array to store modified video data with createdBy fullName
    const videosWithCreatedByFullName = [];

    // Loop through each video and fetch createdBy user's fullName
    for (const video of allVideos) {
      const createdByUser = await user.findById(video.createdBy);
      if (createdByUser) {
        videosWithCreatedByFullName.push({
          _id: video._id,
          roomId: video.roomId,
          createdBy: {
            fullName: createdByUser.fullName,
          },
          title: video.title,
          videoLink: video.videoLink,
          dateAndTime: video.dateAndTime,
          mapImg: video.mapImg
        });
      }
    }

    // If video links are found, return the data as the response
    return res.status(200).json({
      data: videosWithCreatedByFullName,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// get video by ID
export const getVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const video = await Video.findById(id);

    if (!video) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // Fetch the user information based on createdBy ID
    const createdByUser = await user.findById(video.createdBy);

    if (!createdByUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Include the user's fullName in the response
    const response = {
      _id: video._id,
      roomId: video.roomId,
      createdBy: {
        fullName: createdByUser.fullName,
      },
      title: video.title,
      videoLink: video.videoLink,
      dateAndTime: video.dateAndTime,
      mapImg: video
    };

    res.status(200).json({ video: response });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

//update video by ID
export const updateVideoById = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const updatedVideoData = req.body;
    const file = req.file;

    let secure_url: string | null = null;

    if (file) {
      const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(
        file.path
      );
      secure_url = uploadResponse.secure_url;
    }
    updatedVideoData.mapImg = secure_url;

    if (!id) {
      return res.status(400).json({ message: "Room ID is required" });
    }
    const existingVideo = await Video.findById(id);

    if (!existingVideo) {
      return res.status(404).json({ message: 'Video not found' });
    }

    // updating room data
    await Video.findByIdAndUpdate(id, updatedVideoData, { new: true });

    res.status(200).json({ message: 'Video updated successfully', video: updatedVideoData });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
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
      return res.status(404).json({ message: 'Video not found' });
    }
    res.status(200).json({ message: 'Video deleted successfully' });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal server error' });
  }
};
