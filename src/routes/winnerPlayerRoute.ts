import express from "express";
import { postWinningPlayers, getWinningPlayerById, getAllWinningPlayers, getWinnersByRoomUuid } from "../controllers/winnerPlayerController";
import { verifyToken } from "../middlewares/authMiddleware";


const router = express.Router();

// winner creating - Only 'spectator' token is allowed
router.post("/players", verifyToken(['spectator']), postWinningPlayers);

// win players get by id - Only 'spectator, user' token is allowed
router.get("/players/:id", verifyToken(['spectator', 'user']), getWinningPlayerById);

// allwin players get - Only 'spectator, user' token is allowed
router.get("/players", verifyToken(['spectator', 'user']), getAllWinningPlayers);

// allwin players get - Only 'spectator, user' token is allowed
router.get("/get-players/:uuid", verifyToken(['spectator', 'user']), getWinnersByRoomUuid);

export default router;