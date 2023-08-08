import express from "express";

const route = express.Router();
import { verifyToken } from "../middlewares/authMiddleware";
import {
  addTeammates, deleteTeamById, getAllTeams, getTeamById, updateTeamById
} from "../controllers/teamController";


// add up  on new teammates
route.post("/addteam", verifyToken(["user"]), addTeammates);

// get all teams
route.get("/getallteam", verifyToken(["user" ,"spectator"]), getAllTeams);

// get team by their Id
route.get("/getteambyid/:id", verifyToken(["user","spectator"]), getTeamById);

// update team by their Id
route.put("/updateteam/:id", verifyToken(["user"]), updateTeamById);

// delete team by their Id
route.delete("/deleteteam/:id", verifyToken(["user"]), deleteTeamById);

export default route;
