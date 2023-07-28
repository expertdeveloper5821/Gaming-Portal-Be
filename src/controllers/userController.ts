import { user } from "../models/userModel";
import { Request, Response } from "express";
import bcrypt from "bcrypt";
import jwt, { JwtPayload } from "jsonwebtoken";
import { transporter } from "../middlewares/email";
import { v4 as uuidv4 } from "uuid"; // Import uuid library
import { passwordRegex } from "../utils/regexPattern";
import { environmentConfig } from "../config/environmentConfig";

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
      return res
        .status(401)
        .json({ code: 401, message: "Invalid Email address or Password" });
    }
    const token = jwt.sign({ userId: User._id }, environmentConfig.JWT_SECRET, {
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
      environmentConfig.JWT_SECRET,
      {
        expiresIn,
      }
    );

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
          tokne: token,
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
    const decodedToken = jwt.verify(
      token as string,
      environmentConfig.JWT_SECRET
    );
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
  const User:any = user.findById(req.body._id);
  User.populate("role").exec((error, User) => {
    if (error) {
      // Handle error
      return res.status(500).json({ error: "Internal server error" });
    }

    if (!User) {
      // User not found
      return res.status(404).json({ error: "User not found" });
    }

    // Access the actual role document
    const userRole = User.role as Role;
    res.json({ userRole });
  });
};