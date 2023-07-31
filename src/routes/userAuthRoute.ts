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

// signup route
route.post("/signup", userSignup);

// login route
route.post("/login", userLogin);

// forgetPassword route
route.post("/forget-password", forgetPassword);

// resetPassword route
route.post("/reset-password", resetPassword);

// get user by ID
route.get("/getuser/:id", getUserById);

// get Alluser
route.get("/getalluser", getAllUsers);

// update user by id
route.put("/updateuser/:id", updateUserById);

// delete by id
route.delete("/deleteuser/:id", deleteUserById);

export default route;
