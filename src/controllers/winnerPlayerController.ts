import { Request, Response } from "express";
import WinnerPlayers from "../models/winnerPlayerModel";
import { v4 as uuidv4 } from "uuid";
import RoomId from "../models/serverRoomIDModels";
import { userType } from '../middlewares/authMiddleware';
import { Team } from "../models/teamModel";

// Create a new winning player
export const postWinningPlayers = async (req: Request, res: Response) => {
    try {
        // Extract the user ID from the request
        const user = req.user as userType; // Type assertion to userType

        if (!user) {
            return res.status(401).json({ message: 'You are not authenticated!', success: false });
        }

        const userId = user.userId;
        const { roomId } = req.params;
        const teamDataArray = req.body;

        const roomIdData = await RoomId.findOne({ roomUuid: roomId });

        if (!roomIdData) {
            return res.status(401).json({ message: "Room data not found" });
        }

        // Create a new WinnerPlayers object
        const winnerPlayer = new WinnerPlayers({
            winnerUuid: uuidv4(),
            teamData: [], // Initialize an empty array
            createdBy: userId,
            roomId: roomIdData.roomUuid,
        });

        // Iterate through the array and push each team's data into the teamData array
        for (const teamData of teamDataArray) {
            const { teamName, highestKill, chickenDinner, firstWinner, secondWinner } = teamData;
            winnerPlayer.teamData.push({
                teamName,
                highestKill,
                chickenDinner,
                firstWinner,
                secondWinner
            });
        }

        // Save the winnerPlayer object with all team data
        await winnerPlayer.save();

        return res.status(200).json({
            message: "Winner info posted successfully",
            winnerUuid: winnerPlayer.winnerUuid,
            _id: winnerPlayer._id,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to create Winner info",
            success: false,
        });
    }
};


// Get all winning players in lead board
export const getLeaderboard = async (req: Request, res: Response) => {
    try {
        // Extract the user ID from the request
        const user = req.user as userType; // Type assertion to userType
        if (!user) {
            return res.status(401).json({ message: 'You are not authenticated!', success: false });
        }

        // Fetch all WinnerPlayers documents
        const allWinnerPlayers = await WinnerPlayers.find();

        // Create an empty object to store team-wise total points
        const teamTotalPoints: Record<string, number> = {};

        // Calculate total points for each team and find mapType
        allWinnerPlayers.forEach((winnerPlayer) => {
            winnerPlayer.teamData.forEach((teamData: { teamName: string, highestKill: number, chickenDinner: number, firstWinner: number, secondWinner: number }) => {
                const { teamName, highestKill, chickenDinner, firstWinner, secondWinner } = teamData;
                const totalPoints = highestKill + chickenDinner + firstWinner + secondWinner;
                if (!teamTotalPoints[teamName]) {
                    teamTotalPoints[teamName] = 0;
                }
                teamTotalPoints[teamName] += totalPoints;
            });
        });

        // Convert teamTotalPoints to an array for sorting
        const sortedTeams = Object.entries(teamTotalPoints).sort((a, b) => b[1] - a[1]);

        // Create an array to hold the leaderboard data
        const leaderboard = sortedTeams.map(([teamName, totalPoints]) => ({
            teamName,
            totalPoints,
        }));

        return res.status(200).json({ leaderboard });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: 'Failed to fetch leaderboard data',
            success: false,
        });
    }
};


// Get all winning players with room information
// export const getLeaderboard = async (req: Request, res: Response) => {
//     try {
//         // Extract the user ID from the request
//         const user = req.user as userType; // Type assertion to userType
//         if (!user) {
//             return res.status(401).json({ message: 'You are not authenticated!', success: false });
//         }
//         // Fetch all WinnerPlayers documents
//         const allWinnerPlayers = await WinnerPlayers.find();

//         // Created an empty object to store team-wise total highestKill and chickenDinner points
//         const teamTotalPoints: Record<string, { highestKill: number; chickenDinner: number }> = {};

//         // Calculate total highestKill and chickenDinner points for each team
//         allWinnerPlayers.forEach((winnerPlayer) => {
//             winnerPlayer.teamData.forEach((teamData: { teamName: string; highestKill: number; chickenDinner: number }) => {
//                 const { teamName, highestKill, chickenDinner } = teamData;
//                 if (!teamTotalPoints[teamName]) {
//                     teamTotalPoints[teamName] = { highestKill: 0, chickenDinner: 0 };
//                 }
//                 teamTotalPoints[teamName].highestKill += highestKill;
//                 teamTotalPoints[teamName].chickenDinner += chickenDinner;
//             });
//         });

//         // Sorting teams first by highestKill points in descending order, and then by chickenDinner points
//         const sortedTeams = Object.entries(teamTotalPoints).sort((a, b) => {
//             if (b[1].highestKill !== a[1].highestKill) {
//                 return b[1].highestKill - a[1].highestKill;
//             } else {
//                 return b[1].chickenDinner - a[1].chickenDinner;
//             }
//         });

//         // Create an array to hold the leaderboard data
//         const leaderboard = sortedTeams.map(([teamName, { highestKill, chickenDinner }]) => ({
//             teamName,
//             totalHighestKill: highestKill,
//             totalChickenDinner: chickenDinner,
//         }));
//         return res.status(200).json({ leaderboard });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             error: 'Failed to fetch leaderboard data',
//             success: false,
//         });
//     }
// };


// Get winning player by id
// export const getWinningPlayerById = async (req: Request, res: Response) => {
//     try {
//         const { id } = req.params;

//         if (!id) {
//             return res.status(400).json({ message: "id parameter is required" });
//         }

//         const winnerPlayer = await WinnerPlayer.findOne({ _id: id });

//         if (!winnerPlayer) {
//             return res.status(404).json({ message: "Winner player not found" });
//         }

//         const roomIdData = await RoomId.findOne({ roomUuid: winnerPlayer.uuid });

//         if (!roomIdData) {
//             return res.status(404).json({ message: "Room data not found" });
//         }

//         return res.status(200).json({
//             winnerName: winnerPlayer.winnerName,
//             winningPosition: winnerPlayer.winningPosition,
//             winnerUuid: winnerPlayer.winnerUuid,
//             room: {
//                 gameName: roomIdData.gameName,
//                 gameType: roomIdData.gameType,
//                 mapType: roomIdData.mapType
//             },
//         });
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             error: "Failed to fetch winner info",
//             success: false,
//         });
//     }
// };


 // Get all winning players by room UUID
// export const getWinnersByRoomUuid = async (req: Request, res: Response) => {
//     try {
//         const { uuid } = req.params;

//         if (!uuid) {
//             return res.status(400).json({ message: "Room UUID parameter is required" });
//         }

//         const roomIdData = await RoomId.findOne({ roomUuid: uuid });

//         if (!roomIdData) {
//             return res.status(404).json({ message: "Room data not found" });
//         }

//         const winningPlayers = await WinnerPlayer.find({ uuid: roomIdData.roomUuid });

//         if (!winningPlayers || winningPlayers.length === 0) {
//             return res.status(404).json({ message: "No winning players found for this room" });
//         }

//         const winningPlayerData = winningPlayers.map((winnerPlayer) => ({
//             winnerUuid: winnerPlayer.winnerUuid,
//             winnerName: winnerPlayer.winnerName,
//             winningPosition: winnerPlayer.winningPosition,
//             createdBy: winnerPlayer.createdBy,
//             room: {
//                 gameName: roomIdData.gameName,
//                 gameType: roomIdData.gameType,
//                 mapType: roomIdData.mapType,
//             },
//         }));

//         return res.status(200).json(winningPlayerData);
//     } catch (error) {
//         console.error(error);
//         return res.status(500).json({
//             error: "Failed to fetch winning players by room UUID",
//             success: false,
//         });
//     }
// };