import { user } from "../models/passportModels";
import { Request, Response } from "express";
import { environmentConfig } from "../config/environmentConfig";
import { transporter } from "../middlewares/email";
import { Team } from "../models/teamModel";
import { validId } from "../utils/pattern";
import RoomId from "../models/serverRoomIDModels";
import jwt from "jsonwebtoken";
import { Transaction } from "../models/qrCodeModel";


export const addTeammates = async (req: Request, res: Response) => {
  try {
    const {
      emails,
      roomid,
      leadPlayer,
    }: { emails: string[]; leadPlayer: string; roomid: string } = req.body;

    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Invalid input format" });
    }

    const teamData = await RoomId.findOne({ roomUuid: roomid });

    if (teamData) {
      const token = req.header("Authorization")?.replace("Bearer ", "");
      if (!token) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      const secretKey = environmentConfig.JWT_SECRET;
      const decoded: any = jwt.verify(token, secretKey);
      const userId = decoded.userId;

      const leadPlayerUser = await user.findOne({ email: leadPlayer });
      if (!leadPlayerUser) {
        return res
          .status(400)
          .json({ code: 400, message: "Lead player not found" });
      }

      const newTeam = new Team({
        leadPlayer: leadPlayer,
        roomUuid: teamData?.roomUuid,
        teammates: emails,
        leadPlayerId: userId
      });
      await newTeam.save();
      res.status(200).json({
        code: 200,
        message: `Match registration success`,
        _id: newTeam._id,
        leadPlayerId: userId,
        roomUuid: teamData?.roomUuid
      });
    } else {
      res.status(400).json({ code: 400, message: "Team not found" });
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: `Internal Server Error ` });
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
            const teammate = await user.findOne({ email: teammateEmail });
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
          leadPlayer: team.squadLeader,
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

// get Team by ID
export const getTeamById = async (req: Request, res: Response) => {
  try {
    const TeamId = req.params.id;
    if (!validId.test(TeamId)) {
      return res.status(404).json({ error: "Invalid user ID" });
    }

    const foundTeam = await Team.findById(TeamId);
    const gameInfo = await RoomId.findOne({ uuid: foundTeam?.roomUuid });

    if (!foundTeam) {
      return res.status(404).json({
        code: 404,
        message: "Team not found",
      });
    }

    // Fetch details for each teammate using their email addresses
    const teammatesDetails = await Promise.all(
      foundTeam.teamMates.map(async (teammateEmail) => {
        const teammate = await user.findOne({ email: teammateEmail });
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

    // If the user is found, return the team data with teammate details as the response
    return res.status(200).json({
      code: 200,
      data: {
        Team: {
          ...foundTeam.toObject(),
          teammates: teammatesDetails,
        },
        registeredGame: {
          gameName: gameInfo?.gameName,
          gameType: gameInfo?.gameType,
          mapType: gameInfo?.mapType,
        },
      },
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
  time: string;
  date: string;
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
    const token = req.header('Authorization')?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ message: 'Unauthorized' });
    }

    const secretKey = environmentConfig.JWT_SECRET;
    const decoded: any = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    const rooms = await Transaction.find({ paymentBy: userId });

    const detailedRooms = await Promise.all(
      rooms.map(async (room) => {
        const roomIdData = await RoomId.findOne({ roomUuid: room.roomId });

        if (!roomIdData) {
          return null; // Handle the case when roomIdData is not found
        }
        return {
          uuid: roomIdData.uuid,
          _id: roomIdData._id,
          roomUuid: roomIdData.roomUuid,
          gameName: roomIdData.gameName,
          gameType: roomIdData.gameType,
          mapType: roomIdData.mapType,
          time: roomIdData.time,
          date: roomIdData.date,
          roomId: roomIdData.roomId,
          password: roomIdData.password,
          version: roomIdData.version,
          mapImg: roomIdData.mapImg

        };
      })
    );

    const paymentDetailsArray = rooms.map((room) => ({
      id: room._id,
      upiId: room.upiId,
      matchAmount: room.matchAmount,
      name: room.name,
    }));

    res.status(200).json({
      code: 200,
      message: 'Rooms details retrieved successfully',
      numberOfRooms: detailedRooms.length,
      rooms: detailedRooms,
      paymentDetails: paymentDetailsArray,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ code: 500, message: 'Internal Server Error' });
  }

};


// get user regiseter game with teammates
export const getUserRegisteredRoomsWithTeamMates = async (req: Request, res: Response) => {
  try {
    const token = req.header('Authorization')?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const secretKey = environmentConfig.JWT_SECRET;
    const decoded: any = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    // Find all teams where the user is the leadPlayer
    const userTeams = await Team.find({ leadPlayerId: userId });

    if (userTeams.length === 0) {
      return res.status(404).json({ code: 404, message: "No registered rooms found for the user and their teammates" });
    }

    const registeredRooms = await Promise.all(userTeams.map(async (team) => {
      const teammateEmails = team.teamMates;
      const teammateDetails = await user.find({ email: { $in: teammateEmails } });

      const teammatesWithDetails = teammateDetails.map(teammate => ({
        _id: teammate._id,
        fullName: teammate.fullName,
        email: teammate.email,
      }));

      return {
        roomUuid: team.roomUuid,
        leadPlayer: team.squadLeader,
        teammates: teammatesWithDetails,
      };
    }));

    res.status(200).json({ code: 200, message: "Successfully retrieved registered rooms with teammates", registeredRooms });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
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

    const userAndTeammates = await Promise.all(
      teamsInRoom.map(async (team) => {
        const teammateDetails = await user.find({ email: { $in: team.teamMates } });

        const teammatesWithDetails = teammateDetails.map(teammate => ({
          _id: teammate._id,
          fullName: teammate.fullName,
          email: teammate.email,
        }));

        return {
          roomUuid: team.roomUuid,
          leadPlayer: team.squadLeader,
          teammates: teammatesWithDetails,
        };
      })
    );

    res.status(200).json({ code: 200, data: userAndTeammates });
  } catch (error) {
    console.log(error);
    res.status(500).json({ code: 500, message: "Internal Server Error" });
  }
};





