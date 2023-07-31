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
exports.getRoleById = exports.role = exports.spectator = exports.adminSignup = void 0;
const passportModels_1 = require("../models/passportModels");
const bcrypt_1 = __importDefault(require("bcrypt"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environmentConfig_1 = require("../config/environmentConfig");
const roleModel_1 = require("../models/roleModel");
// for admin signup
const adminSignup = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, userName, email, password, role } = req.body;
        const existingUser = yield passportModels_1.user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                code: 400,
                message: `user with email ${email} already exists`,
            });
        }
        // hashing the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new passportModels_1.user({
            fullName,
            userName,
            email,
            password: hashedPassword,
            role
        });
        // saving the user to DB
        yield newUser.save();
        // generating a jwt token to specifically identify the user
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, environmentConfig_1.environmentConfig.JWT_SECRET);
        return res.status(200).json({
            token,
            code: 200,
            message: "user registered successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ code: 500, error: "Internal server error" });
    }
});
exports.adminSignup = adminSignup;
// speactator post request 
const spectator = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { fullName, userName, email, password, role } = req.body;
        const existingUser = yield passportModels_1.user.findOne({ email });
        if (existingUser) {
            return res.status(400).json({
                code: 400,
                message: `user with email ${email} already exists`,
            });
        }
        // hashing the password
        const hashedPassword = yield bcrypt_1.default.hash(password, 10);
        const newUser = new passportModels_1.user({
            fullName,
            userName,
            email,
            password: hashedPassword,
            role
        });
        // saving the user to DB
        yield newUser.save();
        // generating a jwt token to specifically identify the user
        const token = jsonwebtoken_1.default.sign({ userId: newUser._id }, environmentConfig_1.environmentConfig.JWT_SECRET);
        return res.status(200).json({
            token,
            code: 200,
            message: "user registered successfully",
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ code: 500, error: "Internal server error" });
    }
});
exports.spectator = spectator;
const role = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role } = req.body;
        // hashing the password
        const newRole = new roleModel_1.Role({
            role
        });
        // saving the user to DB
        yield newRole.save();
        // generating a jwt token to specifically identify the user
        return res.status(200).json({
            code: 200,
            message: `${role} role created successfully`,
        });
    }
    catch (error) {
        console.log(error);
        return res.status(500).json({ code: 500, error: "Internal server error" });
    }
});
exports.role = role;
const getRoleById = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { id } = req.params;
        const role = yield passportModels_1.user.findById(id).populate('role', 'role');
        if (!role) {
            return res.status(404).json({ error: "role not found" });
        }
        return res.status(200).json(role);
    }
    catch (error) {
        return res.status(500).json({ error: "Failed to fetch role" });
    }
});
exports.getRoleById = getRoleById;
