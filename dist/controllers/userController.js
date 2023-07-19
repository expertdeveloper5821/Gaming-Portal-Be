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
const otpGen_1 = require("../utils/otpGen");
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
            return res
                .status(400)
                .json({ code: 400, message: `Account with email ${email} not found` });
        }
        // setting expiration time of 10 min
        const otp = (0, otpGen_1.generateOTP)();
        const expirationTime = new Date(Date.now() + 600000);
        // Create the JWT
        const expiresIn = "1h";
        const token = jsonwebtoken_1.default.sign({ email, expirationTime, otp }, process.env.jwtSecret, {
            expiresIn,
        });
        const mailOptions = {
            from: process.env.emailUser,
            to: email,
            subject: "Password Reset OTP",
            text: `Your OTP for reset password  is ${otp}`,
        };
        email_1.transporter.sendMail(mailOptions, (err) => {
            if (err) {
                res.status(500).json({ code: 500, message: "Failed to send OTP" });
            }
            else {
                res.json({ code: 200, token: token, message: "OTP sent successfully" });
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
    const { token, otp, newPassword } = req.body;
    try {
        ;
        const decodedToken = jsonwebtoken_1.default.verify(token, process.env.jwtSecret);
        console.log("decodedtoken ins", decodedToken);
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
        const User = yield userModel_1.user.findOne({ email });
        if (!User) {
            return res.status(400).json({ code: 400, message: "User not found" });
        }
        // Set the new password
        if (User) {
            if (!newPassword) {
                return res.status(400).json({ code: 400, message: "New password is required" });
            }
            const hashedPassword = yield bcrypt_1.default.hash(newPassword, 10);
            User.password = hashedPassword;
            yield User.save();
        }
        return res.json({ code: 200, message: "Password reset successful" });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ code: 500, error: "Internal server error" });
    }
});
exports.resetPassword = resetPassword;
