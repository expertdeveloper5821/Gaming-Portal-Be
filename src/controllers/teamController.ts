import { user as User } from "../models/passportModels";
import { Request, Response } from "express";
import { Team } from "../models/teamModel";
import { validId } from "../utils/pattern";
import RoomId from "../models/serverRoomIDModels";
import { Transaction } from "../models/qrCodeModel";
import { userType } from '../middlewares/authMiddleware';
import { Types } from "mongoose";


// get Team by ID
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const TeamId = req.params.id;
    if (!validId.test(TeamId)) {
      return res.status(404).json({ error: "Invalid team ID" });
    }

    const foundTeam = await Team.findById(TeamId);

    if (!foundTeam) {
      return res.status(404).json({
        code: 404,
        message: "Team not found",
      });
    }

    // Fetch details for each teammate using their email addresses
    const teammatesDetails = await Promise.all(
      foundTeam.teamMates.map(async (teammateId) => {
        const teammate = await User.findById(teammateId); // Assuming user model has fullName, email, profilePic fields
        if (teammate) {
          return {
            _id: teammate._id,
            fullName: teammate.fullName,
            email: teammate.email,
            profilePic: teammate.profilePic,
          };
        }
        return null;
      })
    );

    // If the user is found, return the team data with teammate details as the response
    return res.status(200).json({
      code: 200,
      data: {
        Team: {
          ...foundTeam.toObject(),
          teamMates: teammatesDetails, // Replace teamMates with teammate details
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};


export const getUserTeam = async (req: Request, res: Response) => {
  try {
    // Extract the user ID from the request
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    // Find the user's team based on their user ID
    const foundTeam = await Team.findOne({
      $or: [
        { teamMates: userId }, // Check if the user is a team member
        { leadPlayerId: userId }, // Check if the user is the team leader
      ],
    });

    // Initialize the response data
    let responseData: Record<string, any> = {};

    if (foundTeam) {
      // Fetch details for each teammate using their email addresses
      const teammatesDetails = await Promise.all(
        foundTeam.teamMates.map(async (teammateId) => {
          const teammate = await User.findById(teammateId); // Assuming user model has fullName, email, profilePic fields
          if (teammate) {
            return {
              _id: teammate._id,
              fullName: teammate.fullName,
              email: teammate.email,
              profilePic: teammate.profilePic,
            };
          }
          return null;
        })
      );

      // Prepare the response with team details
      responseData = {
        ...foundTeam.toObject(),
        teamMates: teammatesDetails,
      };
    } else {
      // User is not in any team or hasn't created a team
      responseData = [];
    }

    // Return the response
    return res.status(200).json({
      code: 200,
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};


export const addTeammatesIntoMatch = async (req: Request, res: Response) => {
  try {
    const { emails, leaderEmail, roomid } = req.body; // Use "roomid" instead of "roomId"

    // Find the room by roomUuid
    const room = await RoomId.findOne({ roomUuid: roomid }); // Use "roomUuid" instead of "roomId"

    if (!room) {
      return res.status(404).json({ message: 'Room not found' });
    }

    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    // Find the team name associated with the user
    const userTeam = await Team.findOne({ leadPlayerId: userId });

    if (!userTeam) {
      return res.status(404).json({ message: 'User does not belong to a team' });
    }

    // Find the leader's user document by email and get their ObjectId
    const leaderUser = await User.findOne({ email: leaderEmail });
    if (!leaderUser) {
      return res.status(404).json({ message: 'Leader not found' });
    }

    // Find the teammates' user documents by emails and get their ObjectIds
    const teamMateUsers = await User.find({ email: { $in: emails } });
    if (teamMateUsers.length !== emails.length) {
      return res.status(404).json({ message: 'One or more teammates not found' });
    }

    // Check if a similar team configuration already exists in the room
    const isTeamAlreadyRegistered = room.registerTeams.some((team: { teamName: string; leaderId: { equals: (arg0: Types.ObjectId) => any; }; teamMateIds: any[]; }) => {
      return (
        team.teamName === userTeam.teamName &&
        team.leaderId.equals(leaderUser._id) &&
        team.teamMateIds.every((teammateId: any) => teamMateUsers.some((teammate: { _id: { equals: (arg0: any) => any; }; }) => teammate._id.equals(teammateId)))
      );
    });

    if (isTeamAlreadyRegistered) {
      return res.status(400).json({ message: 'You have already registered with these teammates in this room' });
    }

    // Add the teammates to the room's registerTeams array with the user's team name and ObjectIds
    const newTeam = {
      teamName: userTeam.teamName, // Using the team name associated with the user
      leaderId: leaderUser._id, // Storing the leader's ObjectId
      teamMateIds: teamMateUsers.map((teammate) => teammate._id), // Storing an array of teammate ObjectIds
    };

    room.registerTeams.push(newTeam);

    // Save the updated room data
    await room.save();

    return res.status(200).json({ message: 'Teammates added successfully', room });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: 'Failed to add teammates to the room',
      success: false,
    });
  }
};


// get all Teams
export const getAllTeams = async (req: Request, res: Response) => {
  try {
    // Retrieve all teams from the database
    const allTeams = await Team.find();
    const uuids = allTeams.map((team) => team.roomUuid);

    // Retrieve gameInfo for each team using the uuids
    const gameInfoMap: { [uuid: string]: any } = {}; // Map to store game info for each team
    const gameInfo = await RoomId.find({ uuid: { $in: uuids } });
    gameInfo.forEach((info) => {
      gameInfoMap[info.uuid] = {
        gameType: info.gameType,
        gameName: info.gameName,
        mapType: info.mapType,
      };
    });

    if (allTeams.length === 0) {
      return res.status(404).json({
        code: 404,
        message: "No Teams found",
      });
    }

    // Retrieve details for each teammate of each team
    const responseData = await Promise.all(
      allTeams.map(async (team) => {
        const teammateDetails = await Promise.all(
          team.teamMates.map(async (teammateEmail) => {
            const teammate = await User.findOne({ email: teammateEmail });
            if (teammate) {
              return {
                email: teammate.email,
                fullname: teammate.fullName,
                username: teammate.userName,
              };
            }
            return null;
          })
        );

        return {
          _id: team._id,
          uuid: team.roomUuid,
          leadPlayer: team.leadPlayerId,
          teammates: teammateDetails.filter((detail) => detail !== null),
        };
      })
    );

    return res.status(200).json({
      code: 200,
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};


// update user by id
export const updateTeamById = async (req: Request, res: Response) => {
  try {
    const TeamId = req.params.id;
    const updatedTeamData = req.body;

    if (!validId.test(TeamId)) {
      return res.status(404).json({ error: "Invalid user ID" });
    }
    // Use the findByIdAndUpdate method to update the user by their ID in the database
    const updatedTeam = await Team.findByIdAndUpdate(TeamId, updatedTeamData, {
      new: true,
    });

    if (!updatedTeam) {
      return res.status(404).json({
        code: 404,
        message: "Team not found",
      });
    }

    // If the user is updated successfully, return the updated user data as the response
    return res.status(200).json({
      code: 200,
      data: updatedTeam,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};


// delete by id
export const deleteTeamById = async (req: Request, res: Response) => {
  try {
    const TeamId = req.params.id;

    if (!validId.test(TeamId)) {
      return res.status(404).json({ error: "Invalid user ID" });
    }
    // Use the deleteOne method to delete the user by their ID from the database
    const deletionResult = await Team.deleteOne({ _id: TeamId });

    if (deletionResult.deletedCount === 0) {
      return res.status(404).json({
        code: 404,
        message: "Team not found",
      });
    }

    // If the user is deleted successfully, return the deletion result as the response
    return res.status(200).json({
      code: 200,
      message: "deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ code: 500, error: "Internal server error" });
  }
};


interface Room {
  uuid: string;
  gameName: string;
  gameType: string;
  mapType: string;
  dateAndTime: string;
  roomId: string;
  password: string;
  version: string;
  mapImg: string;
  _id: string;
  roomUuid: string;
  teammates: Array<{ fullName: string; email: string }>;
}


// user register room details
export const getUserRegisteredRooms = async (req: Request, res: Response) => {
  try {
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    const transactions = await Transaction.find({ paymentBy: userId });

    const detailedRooms = await Promise.all(
      transactions.map(async (transaction) => {
        const roomUuid = transaction.roomId; // Assuming roomId in Transaction corresponds to roomUuid in RoomId

        const roomIdData = await RoomId.findOne({ roomUuid });

        if (!roomIdData) {
          return null;
        }
        // Fetch the user's email from the user table using the paymentBy field
        const user = await User.findById(transaction.paymentBy);

        return {
          uuid: roomIdData.uuid,
          _id: roomIdData._id,
          roomUuid: roomIdData.roomUuid,
          gameName: roomIdData.gameName,
          gameType: roomIdData.gameType,
          mapType: roomIdData.mapType,
          dateAndTime: roomIdData.dateAndTime,
          roomId: roomIdData.roomId,
          password: roomIdData.password,
          version: roomIdData.version,
          mapImg: roomIdData.mapImg,
          paymentDetails: {
            id: transaction._id,
            upiId: transaction.upiId,
            matchAmount: transaction.matchAmount,
            name: transaction.name,
            paymentBy: user ? user.email : null
          },
        };
      })
    );

    // Filter out null entries from detailedRooms
    const filteredRooms = detailedRooms.filter(room => room !== null);

    res.status(200).json({
      code: 200,
      message: 'Rooms details retrieved successfully',
      numberOfRooms: filteredRooms.length,
      rooms: filteredRooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: 'Internal Server Error' });
  }

};


// get user regiseter game with teammates
export const getUserRegisteredRoomsWithTeamMates = async (req: Request, res: Response) => {
  try {
    const { roomUuid } = req.params;

    // Find the room details based on roomUuid
    const roomDetails = await RoomId.findOne({ roomUuid });

    if (!roomDetails) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Find teams that have registered for this room
    const registeredTeams = await Team.find({ roomUuid });

    // Prepare the response data with user details
    const registeredGames = await Promise.all(registeredTeams.map(async (team) => {
      const teamLeader = await User.findById(team.leadPlayerId);

      const teamMembers = await User.find({ _id: { $in: team.teamMates } });

      return {
        teamName: team.teamName,
        leader: teamLeader
          ? {
            id: teamLeader._id,
            fullName: teamLeader.fullName,
            email: teamLeader.email,
            profilePic: teamLeader.profilePic,
          }
          : null, // Check if teamLeader is not null
        teammates: teamMembers.map((teammate) => ({
          id: teammate._id,
          fullName: teammate.fullName,
          email: teammate.email,
          profilePic: teammate.profilePic,
        })),
        gameDetails: {
          roomUuid: roomDetails.roomUuid,
          gameType: roomDetails.gameType,
          gameName: roomDetails.gameName,
          mapType: roomDetails.mapType
        },
      };
    }));

    res.status(200).json({ data: registeredGames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};



export const getAllUserRegisterRoomWithTeam = async (req: Request, res: Response) => {
  try {
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId; // Get the userId from the decoded token

    // find all games with the specified leaderId (userId)
    const games = await RoomId.find({ 'registerTeams.leaderId': userId });

    // Serialize the data to return to the client
    const serializedGames = [];

    for (const game of games) {
      // Fetch room details from the Room collection
      const roomDetails = await RoomId.findOne({ roomId: game.roomId });

      // Extract teammate information and fetch teammate details from the User collection
      const teammates = await Promise.all(game.registerTeams.map(async (team: { teamMateIds: any[]; teamName: any; }) => {
        const teammateId = team.teamMateIds[0];
        const teammateDetails = await User.findById(teammateId); // Assuming one teammate per team for simplicity

        if (teammateDetails) {
          return {
            teamName: team.teamName,
            teammateDetails: {
              fullName: teammateDetails.fullName || '',
              email: teammateDetails.email || '',
              profilePic: teammateDetails.profilePic || '',
            },
          };
        } else {
          // Handle the case where teammateDetails is null (teammate not found)
          return {
            teamName: team.teamName,
            teammateDetails: {
              fullName: '',
              email: '',
              profilePic: '',
            },
          };
        }
      }));

      if (roomDetails) {
        serializedGames.push({
          roomUuid: game.roomUuid,
          gameType: roomDetails.gameType || '',
          gameName: roomDetails.gameName || '',
          mapType: roomDetails.mapType || '',
          dateAndTime: roomDetails.dateAndTime || null,
          teammates,
        });
      }
    }

    res.status(200).json({ data: serializedGames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

// get users and teammates in a specific room
export const getUsersAndTeammatesInRoom = async (req: Request, res: Response) => {
  try {
    const { roomUuid } = req.params;

    if (!roomUuid) {
      return res.status(400).json({ message: "Room UUID is required" });
    }

    const room = await RoomId.findOne({ roomUuid });

    if (!room) {
      return res.status(404).json({ message: "Room not found" });
    }

    const teamsInRoom = await Team.find({ roomUuid });

    if (teamsInRoom.length === 0) {
      return res.status(404).json({ message: "No teams found in this room" });
    }

    const userAndTeams = await Promise.all(teamsInRoom.map(async (team) => {

      const teammateDetails = await User.find({ _id: { $in: team.teamMates } });

      const teammatesWithDetails = teammateDetails.map((teammate) => ({
        fullName: teammate.fullName,
        email: teammate.email,
        profilePic: teammate.profilePic
      }));

      const leaderDetails = await User.findById(team.leadPlayerId);

      return {
        teamName: team.teamName,
        leadPlayer: {
          fullName: leaderDetails ? leaderDetails.fullName : '',
          email: leaderDetails ? leaderDetails.email : '',
          profilePic: leaderDetails ? leaderDetails.profilePic : '',
        },
        teammates: teammatesWithDetails,
      };
    }));

    res.status(200).json({ numberOfTeams: teamsInRoom.length, roomUuid, data: userAndTeams });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};





