import express from "express";

const route = express.Router();
import { verifyToken } from "../middlewares/authMiddleware";
import {
  addTeammates, deleteTeamById, getAllTeams, getTeamById, updateTeamById
} from "../controllers/teamController";


// add up  on new teammates
route.post("/addteam", addTeammates);

// get all teams
route.get("/getallteam",verifyToken('spectator'),  getAllTeams);

// get team by their Id
route.get("/getteambyid/:id", verifyToken('spectator'), getTeamById);

// update team by their Id
route.put("/updateteam/:id", verifyToken('spectator'), updateTeamById);

// delete team by their Id
route.delete("/deleteteam/:id", verifyToken('spectator'), deleteTeamById);

export default route;
