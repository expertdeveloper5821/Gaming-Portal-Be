import express from "express";
import {
  userSignup,
  userLogin,
  forgetPassword,
  updateUserById,
  deleteUserById,
  resetPassword,
  getUserById,
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

// get user by ID
route.get("/getuser/:id", verifyToken(["admin",'user']), getUserById);

// get Alluser
route.get("/getalluser", verifyToken(["admin"]), getAllUsers);

// update user by id
route.put("/updateuser/:id", verifyToken(["admin",'user']), updateUserById);

// delete by id
route.delete("/deleteuser/:id", verifyToken(["admin",'user']), deleteUserById);

export default route;
