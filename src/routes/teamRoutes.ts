import express from "express";

const route = express.Router();
import { verifyToken } from "../middlewares/authMiddleware";
import {
  addTeammatesIntoMatch, deleteTeamById, getAllTeams, getTeamById, updateTeamById,
   getUserRegisteredRooms, getUserRegisteredRoomsWithTeamMates, getUsersAndTeammatesInRoom,
   getUserTeam, getAllUserRegisterRoomWithTeam, removeUserInTeam, getUserFriendsList
} from "../controllers/teamController";


// add up  on new teammates
route.post("/addteam", verifyToken(["user"]), addTeammatesIntoMatch);

// get all teams
route.get("/getallteam", verifyToken(['admin', 'spectator']), getAllTeams);

// get team by their Id
route.get("/getteambyid/:id", verifyToken(["spectator",'admin','user']), getTeamById);

// update team by their Id
route.put("/updateteam/:id", verifyToken(["user"]), updateTeamById);

// delete team by their Id
route.delete("/deleteteam/:id", verifyToken(["user"]), deleteTeamById);

// get team by their Id
route.get("/register-room", verifyToken(["user"]), getUserRegisteredRooms);

// get room details with teams
route.get("/register-room-mates/:roomUuid", verifyToken(["user"]), getUserRegisteredRoomsWithTeamMates);

// get users and teammates in a specific room
route.get("/register-matches/:roomUuid", verifyToken(["spectator",'admin']), getUsersAndTeammatesInRoom);

// get user all team details 
route.get("/user-all-teams", verifyToken(["user"]), getUserTeam);

// get user team details 
route.get("/user-teams", verifyToken(["user"]), getUserFriendsList);

// get allroom details with teams
route.get("/all-register-room", verifyToken(["user"]), getAllUserRegisterRoomWithTeam);

// remove team mate in teams
route.delete("/remove-team-mate", verifyToken(["user"]), removeUserInTeam);


export default route;