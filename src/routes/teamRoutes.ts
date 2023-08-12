import express from "express";

const route = express.Router();
import { verifyToken } from "../middlewares/authMiddleware";
import {
  addTeammates, deleteTeamById, getAllTeams, getTeamById, updateTeamById, getUserRegisteredRooms, sendInviteMail, getInvitedUser, getUserRegisteredRoomsWithTeamMates
} from "../controllers/teamController";


// add up  on new teammates
route.post("/addteam", verifyToken(["user"]), addTeammates);

// get all teams
route.get("/getallteam", verifyToken(["user" ,"spectator",'admin']), getAllTeams);

// get team by their Id
route.get("/getteambyid/:id", verifyToken(["user","spectator",'admin']), getTeamById);

// update team by their Id
route.put("/updateteam/:id", verifyToken(["user"]), updateTeamById);

// delete team by their Id
route.delete("/deleteteam/:id", verifyToken(["user"]), deleteTeamById);

// get team by their Id
route.get("/register-room/:paymentBy", verifyToken(["user"]), getUserRegisteredRooms);

// post send invite mail
route.post("/send-invite", verifyToken(["user"]), sendInviteMail)

// get user invited by user 
route.get("/get-team", verifyToken(["user"]), getInvitedUser)

// get room details wiht teams
route.get("/register-room-mates/:leadPlayerId", verifyToken(["user"]), getUserRegisteredRoomsWithTeamMates);


export default route;
