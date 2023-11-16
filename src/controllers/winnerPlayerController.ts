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

        // Find the existing WinnerPlayers object for the specified roomId
        let winnerPlayer = await WinnerPlayers.findOne({ roomId: roomIdData.roomUuid });

        // If no WinnerPlayers object exists, create a new one
        if (!winnerPlayer) {
            winnerPlayer = new WinnerPlayers({
                winnerUuid: uuidv4(),
                teamData: [],
                createdBy: userId,
                roomId: roomIdData.roomUuid,
            });
        }

        const registeredTeams = roomIdData.registerTeams.map((team: any) => team.teamName);

        // Iterate through all registered teams and check if they exist in the provided team data
        for (const registeredTeam of registeredTeams) {
            const teamData = teamDataArray.find((team: any) => team.teamName === registeredTeam);

            if (teamData) {
                winnerPlayer.teamData.push(teamData);
            } else {
                winnerPlayer.teamData.push({
                    teamName: registeredTeam,
                    highestKill: 0,
                    chickenDinner: 0,
                    firstWinner: 0,
                    secondWinner: 0,
                });
            }
        }

        // Save the winnerPlayer object with all team data
        await winnerPlayer.save();

        // Update the RoomId model with the winnerUuid
        roomIdData.winnerUuid = winnerPlayer.winnerUuid;
        await roomIdData.save();

        return res.status(200).json({
            message: "Winner info posted successfully",
            winnerUuid: winnerPlayer.winnerUuid,
            _id: winnerPlayer._id,
            roomId: winnerPlayer.roomId
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

        // Create an empty object to store team-wise total points, wins, and losses
        const teamStats: Record<string, { points: number; wins: number; losses: number }> = {};

        // Calculate total points, wins, and losses for each team
        allWinnerPlayers.forEach((winnerPlayer) => {
            winnerPlayer.teamData.forEach((teamData: any) => {
                const { teamName, highestKill, chickenDinner, firstWinner, secondWinner } = teamData;
                const totalPoints = highestKill + chickenDinner + firstWinner + secondWinner;
                if (!teamStats[teamName]) {
                    teamStats[teamName] = { points: 0, wins: 0, losses: 0 };
                }
                if (totalPoints > 0) {
                    teamStats[teamName].wins += 1;
                } else {
                    teamStats[teamName].losses += 1;
                }
                teamStats[teamName].points += totalPoints;
            });
        });

        // Convert teamStats to an array for sorting
        const sortedTeams = Object.entries(teamStats).sort((a, b) => b[1].points - a[1].points);

        // Create an array to hold the leaderboard data with total wins and losses
        const leaderboard = sortedTeams.map(([teamName, stats]) => ({
            teamName,
            totalPoints: stats.points,
            totalWins: stats.wins,
            totalLosses: stats.losses,
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
        const { roomId } = req.params;

        if (!roomId) {
            return res.status(400).json({ message: "Winner UUID parameter is required" });
        }

        const winnerPlayer = await WinnerPlayers.findOne({ roomId });

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
                let arr = winnerPlayer.teamData.filter(i => i.teamName == team.teamName)
        
                let prizeTitles = [];
        
                if ((arr[0]?.highestKill || 0) > 0) {
                    prizeTitles.push('Highest Kill');
                }
                if ((arr[0]?.chickenDinner || 0) > 0) {
                    prizeTitles.push('Chicken Dinner');
                }
                if ((arr[0]?.firstWinner || 0) > 0) {
                    prizeTitles.push('First Winner');
                }
                if ((arr[0]?.secondWinner || 0) > 0) {
                    prizeTitles.push('Second Winner');
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
                    prizeTitles: prizeTitles, 
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
            roomId: winnerPlayer.roomId,
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
        const roomId = req.params.roomId;
        const teamDataArray = req.body;

        if (!roomId) {
            return res.status(400).json({ message: "roomId is required" });
        }

        const existingWinnersData = await WinnerPlayers.findOne({ roomId });
        if (!existingWinnersData) {
            return res.status(404).json({ message: "winner not found" });
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
