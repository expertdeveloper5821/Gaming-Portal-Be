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
Object.defineProperty(exports, "__esModule", { value: true });
const passport = require("passport");
const environmentConfig_1 = require("../config/environmentConfig");
const userModel_1 = require("../models/userModel");
var GoogleStrategy = require("passport-google-oauth20").Strategy;
passport.use(new GoogleStrategy({
    clientID: environmentConfig_1.environmentConfig.CLIENT_ID,
    clientSecret: environmentConfig_1.environmentConfig.CLIENT_SECRET,
    callbackURL: `/auth/google/callback`,
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
