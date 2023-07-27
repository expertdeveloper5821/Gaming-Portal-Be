"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
const passport_1 = __importDefault(require("passport"));
const passportModels_1 = require("../models/passportModels");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const dotenv = __importStar(require("dotenv"));
dotenv.config();
// passport strategy for google
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: process.env.clientID,
    clientSecret: process.env.clientSecret,
    callbackURL: `/auth/google/callback`,
    scope: ["profile", "email"],
}, function (accessToken, refreshToken, profile, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        //  user data
        var userData = {
            email: profile.emails[0].value,
            userName: profile.displayName,
            fullName: profile.displayName,
            provider: profile.provider
        };
        try {
            const existingUser = yield passportModels_1.user.findOne({ email: profile.emails[0].value }).exec();
            if (existingUser) {
                // User exists, update user information if necessary
                return cb(null, existingUser);
            }
            else {
                // saving the user in data base
                const newUser = new passportModels_1.user(userData);
                yield newUser.save();
                return cb(null, newUser);
            }
        }
        catch (err) {
            return cb(err);
        }
    });
}));
// passport serializer
passport_1.default.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user.id);
    });
});
// passport deserializer
passport_1.default.deserializeUser((id, done) => {
    passportModels_1.user.findById(id, "name , email ,username, token", (err, user) => {
        done(err, user);
    });
});
