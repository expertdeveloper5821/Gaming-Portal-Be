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
exports.userRegisteration = void 0;
const userRegisterModel_1 = require("../models/userRegisterModel");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const userRegisteration = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, userName, email, password } = req.body;
        // as {
        //   fullName: string;
        //   userName: string;
        //   email: string;
        //   password: string;
        // };
        // checking if user alredy exists with the same email
        const existingUser = yield userRegisterModel_1.userRegister.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                code: 400,
                message: `user with email ${email} already exists`,
            });
        }
        // hashing the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new userRegisterModel_1.userRegister({
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
        console.error("Error signing up:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
});
exports.userRegisteration = userRegisteration;
