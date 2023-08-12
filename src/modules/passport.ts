import passport from "passport";
import { user } from "../models/passportModels";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { environmentConfig } from "../config/environmentConfig";
import { Role } from "../models/roleModel";
import { v4 as uuidv4 } from "uuid";


// passport strategy for google
passport.use(
  new GoogleStrategy(
    {
      clientID: environmentConfig.CLIENT_ID,
      clientSecret: environmentConfig.CLIENT_SECRET,
      callbackURL: `/auth/google/callback`,
      scope: ["profile", "email"],
    },
    async function (accessToken: String, refreshToken: String, profile: any, cb: any) {   

      const defaultRole = await Role.findOne({ role: "user" });
      
      const newUuid = uuidv4();
          //  user data
      var userData = {
        email: profile.emails[0].value,
        userUuid: newUuid,
        userName: profile.displayName,
        fullName: profile.displayName,
        provider : profile.provider ,
        role : defaultRole,
      };
      try {
        const existingUser = await user.findOne({ email: profile.emails[0].value }).exec();
        if (existingUser) {
          // User exists, update user information if necessary
          return cb(null, existingUser);
        } else {
          // saving the user in data bases
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

// passport serializer
passport.serializeUser(function (user: any, cb: any) {
  process.nextTick(function () {
    cb(null, user._id);
  });
});

// passport deserializer
passport.deserializeUser((id: any, done: any) => {
  user.findOne({ _id: id }, "name email username token")
    .then((user) => {
      done(null, user);
    })
    .catch((err) => {
      done(err, null);
    });
});