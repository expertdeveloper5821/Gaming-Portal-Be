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
const express_1 = __importDefault(require("express"));
const passport_1 = __importDefault(require("passport"));
const passportModels_1 = require("../models/passportModels");
require("../config/db");
require("../modules/passport");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const environmentConfig_1 = require("../config/environmentConfig");
const jwtSecret = environmentConfig_1.environmentConfig.JWT_SECRET;
const clientUrl = environmentConfig_1.environmentConfig.CLIENT_URL;
const router = express_1.default.Router();
// Google login route
router.get("/google", passport_1.default.authenticate("google", { scope: ["profile", "email"] }));
// Google callback
router.get("/google/callback", passport_1.default.authenticate("google", {
    failureRedirect: `${clientUrl}?token=error`,
}), (req, res) => {
    // Redirect to the client with the token
    const user = req.user;
    if (!user) {
        return res.status(400).json({ message: "User not found" });
    }
    try {
        const token = jsonwebtoken_1.default.sign({ user }, jwtSecret, { expiresIn: "1h" });
        res.redirect(`${clientUrl}?token=${token}`);
    }
    catch (error) {
        res.status(500).json({ message: "Error generating token" });
    }
});
// Verify token
router.get("/verify", (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const token = req.query.token;
        if (!token) {
            return res.status(400).json({ message: "Token not found" });
        }
        const decoded = jsonwebtoken_1.default.verify(token, jwtSecret);
        const foundUser = yield passportModels_1.user.findById(decoded.user._id).exec();
        if (!foundUser) {
            return res.status(400).json({ message: "User not found" });
        }
        return res.status(200).json({ message: "Token verified", data: { decoded, user: foundUser } });
    }
    catch (error) {
        return res.status(400).json({ message: "Token not verified", error });
    }
}));
// Logout
router.get("/logout", (req, res) => {
    req.logout;
    res.clearCookie("session");
    res.redirect(clientUrl);
});
exports.default = router;
