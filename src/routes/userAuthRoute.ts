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
import {
  addTeammates, deleteTeamById, getAllTeams, getTeamById, updateTeamById
} from "../controllers/teamController";

// signup route
route.post("/signup", userSignup);

// login route
route.post("/login", userLogin);

// forgetPassword route
route.post("/forget-password", forgetPassword);

// resetPassword route
route.post("/reset-password", resetPassword);

// get user by ID
route.get("/getuser/:id", verifyToken("user"), getUserById);

// get Alluser
route.get("/getalluser", getAllUsers);

// update user by id
route.put("/updateuser/:id", verifyToken("user"), updateUserById);

// delete by id
route.delete("/deleteuser/:id", verifyToken("user"), deleteUserById);

// add up  on new teammates
route.post("/addteam", verifyToken('user'), addTeammates);
route.get("/getallteam",  getAllTeams);
route.get("/getteambyid/:id",  getTeamById);
route.get("/updateteam/:id",  updateTeamById);
route.delete("/deleteteam/:id",  deleteTeamById);



export default route;
