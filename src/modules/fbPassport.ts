const passport = require('passport');
import { user } from "../models/userModel";
var FacebookStrategy = require('passport-facebook').Strategy;
import * as dotenv from "dotenv";
dotenv.config();

passport.use(
  new FacebookStrategy(
    {
      clientID: process.env.appID,
      clientSecret: process.env.appSecret,
      callbackURL: `fbsocial/facebook/callback`
    },
    async function (accessToken: String, refreshToken: String, profile: any, cb: any) {    
        console.log("this si the profile", profile);    
      var userData = {
        email: profile.emails[0].value,
        userName: profile.displayName,
        fullName: profile.displayName,
        provider : profile.provider
      };
      try {
        const existingUser = await user.findOne({ email: profile.emails[0].value }).exec();
        if (existingUser) {
          // User exists, update user information if necessary
          // ...
          return cb(null, existingUser);
        } else {
        const newUser = new user(userData);
          await newUser.save();
          return cb(null, newUser);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);

passport.serializeUser(function (user: any, cb: any) {
  process.nextTick(function () {
    cb(null, user);
  });
});

passport.deserializeUser(function (user: any, cb: any) {
  process.nextTick(function () {
    return cb(null, user);
  });
});