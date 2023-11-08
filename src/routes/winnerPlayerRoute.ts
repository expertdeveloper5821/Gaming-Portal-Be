import express from "express";
import { postWinningPlayers, getLeaderboard, getWinnersByRoomUuid, updatePostwinner } from "../controllers/winnerPlayerController";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();

// winner creating 
router.post("/players/:roomId", verifyToken(['spectator','admin']), postWinningPlayers);

//  get leader board
router.get("/players", verifyToken(['spectator', 'user','admin']), getLeaderboard);

//  allwin players get 
router.get("/get-players/:roomId", verifyToken(['spectator', 'user','admin']), getWinnersByRoomUuid);

// winner updating 
router.put("/players/:roomId", verifyToken(['spectator','admin']), updatePostwinner);

export default router;