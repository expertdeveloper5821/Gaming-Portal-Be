import express from "express";

const route = express.Router();
import { verifyToken } from "../middlewares/authMiddleware";
import {
  addTeammatesIntoMatch, deleteTeamById, getAllTeams, getTeamById, updateTeamById,
   getUserRegisteredRooms, getUserRegisteredRoomsWithTeamMates, getUsersAndTeammatesInRoom
} from "../controllers/teamController";


// add up  on new teammates
route.post("/addteam", verifyToken(["user"]), addTeammatesIntoMatch);

// get all teams
route.get("/getallteam", verifyToken(['admin']), getAllTeams);

// get team by their Id
route.get("/getteambyid/:id", verifyToken(["user","spectator",'admin']), getTeamById);

// update team by their Id
route.put("/updateteam/:id", verifyToken(["user"]), updateTeamById);

// delete team by their Id
route.delete("/deleteteam/:id", verifyToken(["user"]), deleteTeamById);

// get team by their Id
route.get("/register-room", verifyToken(["user"]), getUserRegisteredRooms);

// get room details wiht teams
route.get("/register-room-mates", verifyToken(["user"]), getUserRegisteredRoomsWithTeamMates);

// get users and teammates in a specific room
route.get("/register-matches/:roomUuid", verifyToken(["user","spectator",'admin']), getUsersAndTeammatesInRoom);


export default route;