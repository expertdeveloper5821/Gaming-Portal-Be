"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.forgetPassword = exports.userLogin = exports.userSignup = void 0;
const userModel_1 = require("../models/userModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const email_1 = require("../middlewares/email");
const uuid_1 = require("uuid"); // Import uuid library
// for user signup
const userSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, userName, email, password } = req.body;
        const existingUser = yield userModel_1.user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                code: 400,
                message: `user with email ${email} already exists`,
            });
        }
        // hashing the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new userModel_1.user({
            fullName,
            userName,
            email,
            password: hashedPassword,
        });
        // saving the user to DB
        yield newUser.save();
        // generating a jwt token to specifically identify the user
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, process.env.jwtSecret || "");
        return res.status(200).json({
            token,
            code: 200,
            message: "user registered successfully",
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, error: "Internal server error" });
    }
});
exports.userSignup = userSignup;
// for user login
const userLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { email, password } = req.body;
        const User = yield userModel_1.user.findOne({ email });
        if (!User) {
            return res.status(400).json({
                code: 400,
                message: `user with email ${email} does not exist`,
            });
        }
        const isPasswordValid = yield bcrypt_1.default.compare(password, User.password);
        if (!isPasswordValid) {
            return res.status(401).json({ code: 401, message: "Invalid password" });
        }
        const token = jsonwebtoken_1.default.sign({ userId: User._id }, process.env.jwtSecret || "", {
            expiresIn: "48h",
        });
        return res.status(200).json({
            token,
            code: 200,
            message: "user Login successfully",
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, error: "Internal server error" });
    }
});
exports.userLogin = userLogin;
// to forget password
const forgetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        // Check if email exists in the database
        const User = yield userModel_1.user.findOne({ email });
        if (!User) {
            return res.status(400).json({
                code: 400,
                message: `Account with email ${email} not found`,
            });
        }
        // Generate a unique reset token
        const resetToken = (0, uuid_1.v4)();
        // Create the JWT
        const expiresIn = "1h";
        const token = jsonwebtoken_1.default.sign({ email, resetToken }, process.env.jwtSecret, {
            expiresIn,
        });
        // Construct the reset password URL
        const resetPasswordUrl = `${process.env.reset_password}?token=${token}`;
        // Send the reset password URL in the email
        const mailOptions = {
            from: process.env.emailUser,
            to: email,
            subject: "Reset Password",
            html: `Click on the following link to reset your password <a href=${resetPasswordUrl}>Click Here</a>`,
        };
        email_1.transporter.sendMail(mailOptions, (err) => {
            if (err) {
                res
                    .status(500)
                    .json({
                    code: 500,
                    message: "Failed to send the reset password URL",
                });
            }
            else {
                res.json({
                    code: 200,
                    tokne: token,
                    message: "Reset password URL sent successfully please check your email",
                });
            }
        });
    }
    catch (error) {
        return res.status(500).json({ code: 500, error: "Internal server error" });
    }
});
exports.forgetPassword = forgetPassword;
// to reset password
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { confirmPassword } = req.body;
    try {
        const token = req.query.token;
        // Verify the token
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.jwtSecret);
        const { email } = decodedToken;
        // Check if email exists in the database
        const existingUser = yield userModel_1.user.findOne({ email });
        if (!existingUser) {
            return res.status(400).json({ code: 400, message: "User not found" });
        }
        // Hash the new password
        const saltRounds = 10;
        const hashedPassword = yield bcrypt_1.default.hash(confirmPassword, saltRounds);
        // Update the user's password
        existingUser.password = hashedPassword;
        yield existingUser.save();
        return res.json({ code: 200, message: "Password reset successfully" });
    }
    catch (error) {
        return res
            .status(400)
            .json({ code: 400, message: "Invalid or expired token" });
    }
});
exports.resetPassword = resetPassword;
