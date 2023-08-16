import { Request, Response } from "express";
import WinnerPlayer from "../models/winnerPlayerModel";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";
import { environmentConfig } from "../config/environmentConfig";
import RoomId from "../models/serverRoomIDModels";

// Create a new winning player
export const postWinningPlayers = async (req: Request, res: Response) => {
    try {
        const { winnerName, winningPosition, id } = req.body;

        const roomIdData = await RoomId.findOne({ roomUuid: id });

        if (!winnerName || !winningPosition) {
            return res.status(400).json({ message: "All fields required" });
        } else {
            const token = req.header("Authorization")?.replace("Bearer ", "");
            if (!token) {
                return res.status(401).json({ message: "Unauthorized" });
            }
            const secretKey = environmentConfig.JWT_SECRET;
            try {
                const decoded: any = jwt.verify(token, secretKey);
                const userId = decoded.userId;
                const newUuid = uuidv4();
                if (roomIdData) {
                    await WinnerPlayer.create({
                        winnerUuid: newUuid,
                        winnerName,
                        winningPosition,
                        createdBy: userId,
                        uuid: roomIdData?.roomUuid,
                    });
                    return res.status(200).json({
                        message: "Winner info post successfully",
                        winnerUuid: newUuid,
                    });
                } else {
                    return res.status(401).json({ message: "room data not found" });
                }
            } catch (error) {
                console.error(error);
                return res.status(401).json({ message: "Invalid token" });
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create Winner info",
            success: false,
        });
    }
};


// Get winning player by id
export const getWinningPlayerById = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id) {
            return res.status(400).json({ message: "id parameter is required" });
        }

        const winnerPlayer = await WinnerPlayer.findOne({ _id: id });

        if (!winnerPlayer) {
            return res.status(404).json({ message: "Winner player not found" });
        }

        const roomIdData = await RoomId.findOne({ roomUuid: winnerPlayer.uuid });

        if (!roomIdData) {
            return res.status(404).json({ message: "Room data not found" });
        }

        return res.status(200).json({
            winnerName: winnerPlayer.winnerName,
            winningPosition: winnerPlayer.winningPosition,
            winnerUuid: winnerPlayer.winnerUuid,
            room: {
                gameName: roomIdData.gameName,
                gameType: roomIdData.gameType,
                mapType: roomIdData.mapType
            },
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch winner info",
            success: false,
        });
    }
};


// Get all winning players with room information
export const getAllWinningPlayers = async (req: Request, res: Response) => {
    try {
        const winningPlayers = await WinnerPlayer.find();

        if (!winningPlayers) {
            return res.status(404).json({ message: "No winning players found" });
        }

        const winningPlayerData = [];

        for (const winnerPlayer of winningPlayers) {
            const roomIdData = await RoomId.findOne({ roomUuid: winnerPlayer.uuid });

            if (!roomIdData) {
                console.warn(`Room data not found for winner with UUID: ${winnerPlayer.uuid}`);
                continue; // Skip this winner if room data is not found
            }

            const winningPlayerInfo = {
                winnerUuid: winnerPlayer.winnerUuid,
                winnerName: winnerPlayer.winnerName,
                winningPosition: winnerPlayer.winningPosition,
                createdBy: winnerPlayer.createdBy,
                uuid: winnerPlayer.uuid,
                room: {
                    gameName: roomIdData.gameName,
                    gameType: roomIdData.gameType,
                    mapType: roomIdData.mapType,
                },
            };

            winningPlayerData.push(winningPlayerInfo);
        }

        return res.status(200).json(winningPlayerData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch winning players",
            success: false,
        });
    }
};


// Get all winning players by room UUID
export const getWinnersByRoomUuid = async (req: Request, res: Response) => {
    try {
        const { uuid } = req.params;

        if (!uuid) {
            return res.status(400).json({ message: "Room UUID parameter is required" });
        }

        const roomIdData = await RoomId.findOne({ roomUuid: uuid });

        if (!roomIdData) {
            return res.status(404).json({ message: "Room data not found" });
        }

        const winningPlayers = await WinnerPlayer.find({ uuid: roomIdData.roomUuid });

        if (!winningPlayers || winningPlayers.length === 0) {
            return res.status(404).json({ message: "No winning players found for this room" });
        }

        const winningPlayerData = winningPlayers.map((winnerPlayer) => ({
            winnerUuid: winnerPlayer.winnerUuid,
            winnerName: winnerPlayer.winnerName,
            winningPosition: winnerPlayer.winningPosition,
            createdBy: winnerPlayer.createdBy,
            room: {
                gameName: roomIdData.gameName,
                gameType: roomIdData.gameType,
                mapType: roomIdData.mapType,
            },
        }));

        return res.status(200).json(winningPlayerData);
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch winning players by room UUID",
            success: false,
        });
    }
};