import express, { Request, Response } from "express";
import passport from "passport";
import { user as User } from "../models/passportModels";
import "../config/db";
import "../modules/passport";
import jwt from "jsonwebtoken";
import { environmentConfig } from '../config/environmentConfig';

const jwtSecret: string = environmentConfig.JWT_SECRET;
const clientUrl: string = environmentConfig.CLIENT_URL

const router = express.Router();

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
    const user = req.user;
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    try {
      await User.populate(user, { path: 'role' });
      const token = jwt.sign({ user }, jwtSecret!, { expiresIn: "1h" });
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
    const decoded = jwt.verify(token as string, jwtSecret!) as { user: any };
    const foundUser = await User.findById(decoded.user._id).exec(); 
    if (!foundUser) {
      return res.status(400).json({ message: "User not found" });
    }
    return res.status(200).json({ message: "Token verified", data: { decoded, user: foundUser } });
  } catch (error) {
    return res.status(400).json({ message: "Token not verified", error });
  }
});

// Logout
router.get("/logout", (req: Request, res: Response) => {
  req.logout;
  res.clearCookie("session");
  res.redirect(clientUrl!);
});

export default router;