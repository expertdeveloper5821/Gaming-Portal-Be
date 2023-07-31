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
const passport_1 = __importDefault(require("passport"));
const passportModels_1 = require("../models/passportModels");
const passport_google_oauth20_1 = require("passport-google-oauth20");
const environmentConfig_1 = require("../config/environmentConfig");
// passport strategy for google
passport_1.default.use(new passport_google_oauth20_1.Strategy({
    clientID: environmentConfig_1.environmentConfig.CLIENT_ID,
    clientSecret: environmentConfig_1.environmentConfig.CLIENT_SECRET,
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
