import { user } from "../models/passportModels";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { transporter } from "../middlewares/email";
import { v4 as uuidv4 } from "uuid";
import { passwordRegex } from "../utils/helper";
import { environmentConfig } from "../config/environmentConfig";
import { Role } from "../models/roleModel";
import { validId } from "../utils/pattern";
import { v2 as cloudinary, UploadApiResponse } from "cloudinary";


// Configuration
cloudinary.config({
  cloud_name: environmentConfig.CLOUD_NAME,
  api_key: environmentConfig.API_KEY,
  api_secret: environmentConfig.API_SECRET
});

const jwtSecret: string = environmentConfig.JWT_SECRET;
const clickHere: string = environmentConfig.LOGIN_PAGE;

// for user signup
export const userSignup = async (req: Request, res: Response) => {
  try {
    const { fullName, userName, email, password, upiId } = req.body;

    // Password validation check
    if (!passwordRegex.test(password)) {
      return res.status(400).json({
        code: 400,
        message:
          "Password must contain at least one letter, one digit, one special character (!@#$%^&*()_+), and be at least 6 characters long",
      });
    }
    const existingUser = await user.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        code: 400,
        message: `user with email ${email} already exists`,
      });
    }
    const defaultRole = await Role.findOne({ role: "user" });

    // hashing the password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Send the reset password URL in the email
    const mailOptions = {
      from: environmentConfig.EMAIL_USER,
      to: email,
      subject: "User Credentials",
      html: `Thankyou for your registration in pattseheadshot.com, <a href=${clickHere}>Click Here</a> for direct login <br>
      These are the Your login Credentials Please Do not share with anyone <br> your email:- ${email} <br> your password:- ${password}  </br>`,
    };
    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        res.status(500).json({
          message: "Failed to send the credential email",
        });
      } else {
        const newUuid = uuidv4();
        const newUser = new user({
          fullName,
          userName,
          email,
          password: hashedPassword,
          role: defaultRole,
          userUuid: newUuid,
          upiId
        });
        // saving the user to DB
        newUser.save();
        // generating a jwt token to specifically identify the user
        const token = jwt.sign({ userId: newUser._id }, jwtSecret || "");
        return res.status(200).json({
          message: "Registered successfully, Please check your email",
          userUuid: newUuid,
          token,
          success: true,
        });
      }
    })
  } catch (error) {
    console.log(error);

    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// for user login
export const userLogin = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;
    const User = await user.findOne({ email }).populate("role", "role");
    if (!User) {
      return res.status(400).json({
        code: 400,
        message: `Invalid Email address or Password`,
      });
    }
    const isPasswordValid = await bcrypt.compare(password, User.password);

    if (!isPasswordValid) {
      return res
        .status(401)
        .json({ code: 401, message: "Invalid Email address or Password" });
    }
    const token = jwt.sign(
      { userId: User._id, role: User.role },
      environmentConfig.JWT_SECRET,
      {
        expiresIn: "1h",
      }
    );
    let userData = {
      userUuid: User.userUuid,
      fullName: User.fullName,
      email: User.email,
      token: token,
    };

    return res.status(200).json({
      userData,
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
      return res.status(400).json({
        code: 400,
        message: `Account with email ${email} not found`,
      });
    }

    // Generate a unique reset token
    const resetToken = uuidv4();

    // Create the JWT
    const expiresIn = "1h";
    const token = jwt.sign({ email, resetToken }, jwtSecret as string, {
      expiresIn,
    });

    // Construct the reset password URL
    const resetPasswordUrl = `${environmentConfig.RESET_PASSWORD}?token=${token}`;

    // Send the reset password URL in the email
    const mailOptions = {
      from: environmentConfig.EMAIL_USER,
      to: email,
      subject: "Reset Password",
      html: `Click on the following link to reset your password <a href=${resetPasswordUrl}>Click Here</a>`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        res.status(500).json({
          code: 500,
          message: "Failed to send the reset password URL",
        });
      } else {
        res.json({
          code: 200,
          token: token,
          message:
            "Reset password URL sent successfully please check your email",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// to reset password
export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword, confirmPassword } = req.body;

  try {
    const token = req.query.token;
    // Verify the token
    const decodedToken = jwt.verify(token as string, jwtSecret as Secret);
    const { email } = decodedToken as JwtPayload;

    // Check if email exists in the database
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ code: 400, message: "User not found" });
    }
    // Add validation: Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res
        .status(400)
        .json({ code: 400, message: "Passwords must be same" });
    }
    if (!passwordRegex.test(confirmPassword)) {
      return res.status(400).json({
        code: 400,
        message:
          "Password must contain at least one letter, one digit, one special character (!@#$%^&*()_+), and be at least 6 characters long",
      });
    }
    // Hash the new password
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(confirmPassword, saltRounds);

    // Update the user's password
    existingUser.password = hashedPassword;
    await existingUser.save();

    return res.json({ code: 200, message: "Password reset successfully" });
  } catch (error) {
    return res
      .status(400)
      .json({ code: 400, message: "Invalid or expired token" });
  }
};

// role based controller
export const adminController = async (req: Request, res: Response) => {
  const User: any = user.findById(req.body._id);
  User.populate("role").exec((error: any, user: typeof User | null) => {
    if (error) {
      // Handle error
      return res.status(500).json({ error: "Internal server error" });
    }
    if (!User) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }
    // Access the actual role document
    const userRole = User.role;
    return res.status(200).json({ code: 200, message: "welcome admin" });
  });
};

// get user by ID
export const getUserDetails = async (req: Request, res: Response) => {
  try {
    // Extract the authentication token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    // Verify and decode the token to get the user's ID
    const decodedToken = jwt.verify(token, jwtSecret) as { userId: string };

    const userId = decodedToken.userId;

    // Use the findById method to find the user by their ID in the database
    const foundUser = await user.findById(userId).populate('role', 'role');

    if (!foundUser) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    // If the user is found, construct the response object
    const responseData = {
      userUuid: foundUser.userUuid,
      fullName: foundUser.fullName,
      userName: foundUser.userName,
      email: foundUser.email,
      role: foundUser.role,
      upiId: foundUser.upiId,
      phoneNumber: foundUser.phoneNumber,
      teamName: foundUser.teamName,
      profilePic: foundUser.profilePic
    };

    // Return the user data as the response
    return res.status(200).json({
      code: 200,
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// get all users
export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const { search } = req.query;

    let usersQuery = {};

    if (search) {
      usersQuery = {
        $or: [
          { fullName: { $regex: search, $options: 'i' } },
          { userName: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } },
        ],
      };
    }

    const allUsers = await user
      .find(usersQuery)
      .populate('role', 'role');

    if (allUsers.length === 0) {
      return res.status(404).json({
        code: 404,
        message: search ? "No users found with the provided query" : "No users found",
      });
    }

    return res.status(200).json({
      code: 200,
      data: allUsers.map((data) => {
        return {
          userUuid: data?.userUuid,
          fullName: data?.fullName,
          userName: data?.userName,
          email: data?.email,
          role: data?.role,
        };
      }),
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// update user by id
export const userUpdate = async (req: Request, res: Response) => {
  try {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    const decodedToken = jwt.verify(token, jwtSecret) as { userId: string };

    const userId = decodedToken.userId;

    const updatedUserData = req.body;

    const file = req.file;
    const tempPath = file?.path;

    let secure_url: string | null = null;
    if (tempPath) {
      const uploadResponse: UploadApiResponse = await cloudinary.uploader.upload(
        tempPath
      );
      secure_url = uploadResponse.secure_url;
    }

    if (secure_url) {
      updatedUserData.profilePic = secure_url; // Update profilePic field in updatedUserData
    }

    const updatedUser = await user.findByIdAndUpdate(userId, updatedUserData, {
      new: true,
    }).populate('role', 'role');

    if (!updatedUser) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    // Return the updated user data as the response
    return res.status(200).json({
      code: 200,
      data: updatedUser,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// delete by id
export const userDelete = async (req: Request, res: Response) => {
  try {
    // Extract the authentication token from the request headers
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: "Authentication token missing" });
    }

    // Verify and decode the token to get the user's ID
    const decodedToken = jwt.verify(token, jwtSecret) as { userId: string };

    const userId = decodedToken.userId;

    // Use the deleteOne method to delete the user by their ID from the database
    const deletionResult = await user.deleteOne({ _id: userId });

    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({
        code: 404,
        message: "User not found",
      });
    }

    // If the user is deleted successfully, return the deletion result as the response
    return res.status(200).json({
      code: 200,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};


