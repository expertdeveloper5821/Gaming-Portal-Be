import { user } from "../models/userModel";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload, Secret } from "jsonwebtoken";
import { transporter } from "../middlewares/email";
import { v4 as uuidv4 } from "uuid"; // Import uuid library

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
      process.env.jwtSecret as string,
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
  const { confirmPassword } = req.body;

  try {
    const token = req.query.token;
    // Verify the token
    const decodedToken = jwt.verify(
      token as string,
      process.env.jwtSecret as Secret
    );
    const { email } = decodedToken as JwtPayload;

    // Check if email exists in the database
    const existingUser = await user.findOne({ email });
    if (!existingUser) {
      return res.status(400).json({ code: 400, message: "User not found" });
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
