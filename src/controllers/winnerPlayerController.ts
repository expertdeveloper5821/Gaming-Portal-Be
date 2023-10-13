import { Request, Response } from "express";
import WinnerPlayers from "../models/winnerPlayerModel";
import { v4 as uuidv4 } from "uuid";
import RoomId from "../models/serverRoomIDModels";
import { userType } from '../middlewares/authMiddleware';
import { user } from "../models/passportModels";


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
            winnerPlayer.teamData.forEach((teamData: any) => {
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


// Get all winning players by room UUID
export const getWinnersByRoomUuid = async (req: Request, res: Response) => {
    try {
        const { winnerUuid } = req.params;

        if (!winnerUuid) {
            return res.status(400).json({ message: "Winner UUID parameter is required" });
        }

        const winnerPlayer = await WinnerPlayers.findOne({ winnerUuid });

        if (!winnerPlayer) {
            return res.status(404).json({ message: "Winner player data not found" });
        }

        const roomIdData = await RoomId.findOne({ roomUuid: winnerPlayer.roomId });

        if (!roomIdData) {
            return res.status(404).json({ message: "Room data not found" });
        }

        const teamDetails = await Promise.all(
            roomIdData.registerTeams.map(async (team: any) => {
                const leaderData = await user.findOne({ _id: team.leaderId });

                if (!leaderData) {
                    throw new Error("Leader data not found");
                }

                const teamMembersData = await Promise.all(
                    team.teamMateIds.map(async (memberId: any) => {
                        const userData = await user.findOne({ _id: memberId });

                        if (!userData) {
                            throw new Error("User data not found");
                        }

                        return {
                            fullName: userData.fullName,
                            profilePic: userData.profilePic,
                        };
                    })
                );

                return {
                    teamName: team.teamName,
                    leader: {
                        fullName: leaderData.fullName,
                        profilePic: leaderData.profilePic,
                    },
                    teamMembers: teamMembersData,
                };
            })
        );

        return res.status(200).json({
            winnerUuid: winnerPlayer.winnerUuid,
            room: {
                gameName: roomIdData.gameName,
                gameType: roomIdData.gameType,
                mapType: roomIdData.mapType,
                dateAndTime: roomIdData.dateAndTime,
            },
            teams: teamDetails,
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to fetch data for the winner UUID",
            success: false,
        });
    }
};


// update winner api
export const updatePostwinner = async (req: Request, res: Response) => {
    try {
        const winnerUuid = req.params._id;
        const teamDataArray = req.body;

        if (!winnerUuid) {
            return res.status(400).json({ message: "winnerId is required" });
        }

        const existingWinnersData = await WinnerPlayers.findById(winnerUuid);
        if (!existingWinnersData) {
            return res.status(404).json({ message: "winnerId not found" });
        }

        // Update the team data
        existingWinnersData.teamData = teamDataArray;

        // Save the updated data
        const updatedWinnersData = await existingWinnersData.save();

        return res.status(200).json({ message: "Winner data updated successfully", updatedWinnersData });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            error: "Failed to update winners",
            success: false,
        });
    }
};
