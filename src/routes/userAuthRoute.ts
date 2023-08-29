import express from "express";
import {
  userSignup,
  userLogin,
  forgetPassword,
  updateUserById,
  deleteUserById,
  resetPassword,
  getUserDetails,
  getAllUsers,
} from "../controllers/userController";
const route = express.Router();
import { verifyToken } from "../middlewares/authMiddleware";

// signup route
route.post("/signup", userSignup);

// login route
route.post("/login", userLogin);

// forgetPassword route
route.post("/forget-password", forgetPassword);

// resetPassword route
route.post("/reset-password", resetPassword);

// get single user 
route.get("/getuser", getUserDetails);

// get Alluser
route.get("/getalluser", verifyToken(["admin", 'spectator']), getAllUsers);

// update user 
route.put("/updateuser", verifyToken(["admin",'user']), updateUserById);

// delete by id
route.delete("/deleteuser", verifyToken(["admin",'user']), deleteUserById);

export default route;
