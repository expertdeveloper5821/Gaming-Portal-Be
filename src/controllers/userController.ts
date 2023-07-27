import { user } from "../models/passportModels";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { transporter } from "../middlewares/email";
import { v4 as uuidv4 } from "uuid"; // Import uuid library
import { passwordRegex } from "../utils/helper";
import { environmentConfig } from '../config/environmentConfig';

const jwtSecret: string = environmentConfig.JWT_SECRET;


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
      jwtSecret || ""
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
        message: `Invalid Email address or Password`,
      });
    }
    const isPasswordValid = await bcrypt.compare(password, User.password);

    if (!isPasswordValid) {
      return res.status(401).json({ code: 401, message: "Invalid Email address or Password" });
    }
    // creating the jwt token 
    const token = jwt.sign({ userId: User._id }, jwtSecret || "", {
      expiresIn: "48h",
    });
    // sending the token in response
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
      return res.status(400).json({
        code: 400,
        message: `Account with email ${email} not found`,
      });
    }

    // Generate a unique reset token
    const resetToken = uuidv4();

    // Create the JWT
    const expiresIn = "1h";
    const token = jwt.sign(
      { email, resetToken },
      jwtSecret as string,
      {
        expiresIn,
      }
    );

    // Construct the reset password URL
    const resetPasswordUrl = `${process.env.reset_password}?token=${token}`;

    // Send the reset password URL in the email
    const mailOptions = {
      from: process.env.emailUser,
      to: email,
      subject: "Reset Password",
      html: `Click on the following link to reset your password <a href=${resetPasswordUrl}>Click Here</a>`,
    };

    transporter.sendMail(mailOptions, (err) => {
      if (err) {
        res
          .status(500)
          .json({
            code: 500,
            message: "Failed to send the reset password URL",
          });
      } else {
        res.json({
          code: 200,
          tokne: token,
          message: "Reset password URL sent successfully please check your email",
        });
      }
    });
  } catch (error) {
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};

// to reset password
export const resetPassword = async (req: Request, res: Response) => {
  const { newPassword,confirmPassword } = req.body;

  try {
    const token = req.query.token;
    // Verify the token
    const decodedToken = jwt.verify(
      token as string,
      jwtSecret as Secret
    );
    const { email } = decodedToken as JwtPayload;

    // Check if email exists in the database
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ code: 400, message: "User not found" });
    }
    // Add validation: Check if the new password and confirm password match
    if (newPassword !== confirmPassword) {
      return res.status(400).json({ code: 400, message: 'Passwords must be same' });
    }
    if (!passwordRegex.test(confirmPassword)) {
      return res.status(400).json({
        code: 400,
        message:
          'Password must contain at least one letter, one digit, one special character (!@#$%^&*()_+), and be at least 6 characters long',
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
