import express, { Request, Response } from "express";
import passport from "passport";
import { user as User } from "../models/passportModels";
import "../config/db";
import "../modules/passport";
import jwt from "jsonwebtoken";
import { environmentConfig } from '../config/environmentConfig';
import { userType } from "../middlewares/authMiddleware";
import { verifyToken } from "../middlewares/authMiddleware";
import { Team } from "../models/teamModel";

const jwtSecret: string = environmentConfig.JWT_SECRET;
const clientUrl: string = environmentConfig.CLIENT_URL

const router = express.Router();

interface User {
  _id: string;
  fullName: string;
  userName: string;
  email: string;
  provider: string;
  userUuid: string;
  phoneNumber: number;
  upiId: string;
  profilePic: string;
  teamName: string;
  role: string;
}

// Google login route
router.get("/google", passport.authenticate("google", { scope: ["profile", "email"] }));

// Google callback
router.get(
  "/google/callback",
  passport.authenticate("google", {
    failureRedirect: `${clientUrl}?token=error`,
  }),
  async (req: Request, res: Response) => {
    // Redirect to the client with the token
    const user = req.user as User;
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }

    try {
      await User.populate(user, { path: 'role' });
      // Extract the necessary fields from the user object
      const { _id: userId, fullName, userName, email, provider, role, phoneNumber, userUuid, profilePic, upiId } = user;

      // Retrieve user's team where the user is the lead player
      const team = await Team.findOne({ leadPlayerId: user._id });

      // Extract team name if the team exists
      const teamName = team ? team.teamName : null;

      // Construct a simplified user object
      const userData = {
        userId,
        role,
        fullName,
        userName,
        email,
        phoneNumber,
        upiId,
        teamName: teamName,
        profilePic,
        userUuid,
        provider,
      };
      const token = jwt.sign(userData, jwtSecret!, { expiresIn: "1h" });
      res.redirect(`${clientUrl}?token=${token}`);
    } catch (error) {
      res.status(500).json({ message: "Error generating token" });
    }
  }
);


// Verify token
router.get("/verify", async (req: Request, res: Response) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ message: "Token not found" });
    }
    const decoded = jwt.verify(token as string, jwtSecret!);

    if (!decoded) {
      return res.status(400).json({ message: "Invalid token" });
    }

    return res.status(200).json({ message: "Token verified", data: decoded });
  } catch (error) {
    return res.status(400).json({ message: "Token not verified", error });
  }
});








// // function to handle token expiration
// const handleTokenExpiration = (userId: any) => {
//   setTimeout(async () => {
//     try {
//       // Set isOnline status to false after token expiration
//       await User.findOneAndUpdate({ _id: userId }, { isOnline: false });
//     } catch (error) {
//       console.error(error);
//     }
//   }, 60000); // 1 minute in milliseconds
// };


// // Logout api
// router.get("/logout", verifyToken(["admin", 'spectator','user']), async (req: Request, res: Response) => {
//   try {
//     // get the logged in user userId
//     const user = req.user as userType;

//     if (!req.user) {
//       throw new Error('User not found in request.');
//     }

//     const userId = user.userId;

//     // updating the field to set online false when he logged out
//     await User.findOneAndUpdate({ _id: userId }, { isOnline: false });

//     // clear the cookie session
//     res.clearCookie("session");

//     // Call the middleware function to handle token expiration
//     handleTokenExpiration(userId);

//     // sending back user to login page
//     res.redirect(clientUrl!);
//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ error: 'Internal server error' });
//   }
// });

export default router;