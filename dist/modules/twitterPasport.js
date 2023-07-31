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
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const userModel_1 = require("../models/userModel");
var TwitterStrategy = require("passport-twitter").Strategy;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
passport.use(new TwitterStrategy({
    clientID: ' TWITTER_CONSUMER_KEY',
    clientSecret: 'TWITTER_CONSUMER_SECRET',
    callbackURL: `/twittersocial/twitter/callback`,
    scope: ["profile", "email"],
}, function (accessToken, refreshToken, profile, cb) {
    return __awaiter(this, void 0, void 0, function* () {
        var userData = {
            email: profile.emails[0].value,
            userName: profile.displayName,
            fullName: profile.displayName,
            provider: profile.provider
        };
        try {
            const existingUser = yield userModel_1.user.findOne({ email: profile.emails[0].value }).exec();
            if (existingUser) {
                // User exists, update user information if necessary
                // ...
                return cb(null, existingUser);
            }
            else {
                const newUser = new userModel_1.user(userData);
                yield newUser.save();
                return cb(null, newUser);
            }
        }
        catch (err) {
            return cb(err);
        }
    });
}));
passport.serializeUser(function (user, cb) {
    process.nextTick(function () {
        cb(null, user);
    });
});
passport.deserializeUser(function (user, cb) {
    process.nextTick(function () {
        return cb(null, user);
    });
});
