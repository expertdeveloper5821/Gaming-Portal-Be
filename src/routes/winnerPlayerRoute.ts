import express from "express";
import { postWinningPlayers, 
    getLeaderboard
    // getWinningPlayerById, , getWinnersByRoomUuid 
} from "../controllers/winnerPlayerController";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();

// winner creating - 
router.post("/players/:roomId", verifyToken(['spectator','admin']), postWinningPlayers);

// // win players get by id 
// router.get("/players/:id", verifyToken(['spectator', 'user','admin']), getWinningPlayerById);

// // allwin players get 
router.get("/players", verifyToken(['spectator', 'user','admin']), getLeaderboard);

// // allwin players get 
// router.get("/get-players/:uuid", verifyToken(['spectator', 'user','admin']), getWinnersByRoomUuid);

export default router;