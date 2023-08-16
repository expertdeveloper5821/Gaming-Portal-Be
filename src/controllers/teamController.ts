import { user } from "../models/passportModels";
import { Request, Response } from "express";
import { environmentConfig } from "../config/environmentConfig";
import { transporter } from "../middlewares/email";
import { Team } from "../models/teamModel";
import { validId } from "../utils/pattern";
import RoomId from "../models/serverRoomIDModels";
import jwt from "jsonwebtoken";
import { Transaction } from "../models/qrCodeModel";

// add players
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

     // Check if the user is already registered in the room
     const isUserRegistered = await Team.findOne({
      roomUuid: roomid,
      teammates: { $in: emails },
    });

    if (isUserRegistered) {
      return res.status(409).json({ code: 409, message: "You have already registered in this room" });
    }

    // Fetch registered emails from the database
    const allUsers = await user.find();
    const allEmails = allUsers.map((obj) => {
      return obj.email;
    });

    // Filter unregistered email addresses
    const unregisteredEmails = emails.filter(
      (email: any) => !allEmails.includes(email)
    );
    const registeredEmails = emails.filter((email: any) =>
      allEmails.includes(email)
    );
    // frontend registrration URL
    const registrationUrl = `${environmentConfig.CLIENT_URL}signup`;
    // Send emails to unregistered email addresses
    for (const email of unregisteredEmails) {
      await transporter.sendMail({
        from: environmentConfig.EMAIL_USER,
        to: email,
        subject: "Registration Link",
        html: `Welcome to our website! Thank you for joining us. <a href=${registrationUrl}>Click Here</a>`,
      });
    }
    if (unregisteredEmails.length === 0) {
      if (teamData) {
        const token = req.header('Authorization')?.replace("Bearer ", "");
        if (!token) {
          return res.status(401).json({ message: "Unauthorized" });
        }
        const secretKey = environmentConfig.JWT_SECRET;
        const decoded: any = jwt.verify(token, secretKey);
        const userId = decoded.userId;
        const newTem = new Team({
          leadPlayer: leadPlayer,
          roomUuid: teamData?.roomUuid,
          teammates: emails,
          leadPlayerId: userId
        });
        await newTem.save();
        res.status(200).json({
          code: 200,
          message: `Match registeration success`,
          registeredEmails,
          leadPlayerId: userId,
          roomUuid: teamData?.roomUuid,
        });
      } else {
        res.status(400).json({ code: 400, message: "Team not found" });
      }
    } else {
      res.status(422).json({
        code: 422,
        message: `All your Teammates are not registered with us. Registration emails sent successfully to unregistered teammates please register first and continue`,
        unregisteredEmails,
        registeredEmails,
      });
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
          team.teammates.map(async (teammateEmail) => {
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
          uuid: team.roomUuid,
          leadPlayer: team.leadPlayer,
          teammates: teammateDetails.filter((detail) => detail !== null),
          registeredGame: gameInfoMap[team.roomUuid], // Retrieve game info using the map
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
      foundTeam.teammates.map(async (teammateEmail) => {
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



// send invite mail to teammates
export const sendInviteMail = async (req: Request, res: Response) => {
  try {
    const { emails } = req.body;

    // Fetch user details for each teammate
    const existingUsers = await user.find({ email: { $in: emails } });
    const existingEmails = existingUsers.map(existingUser => existingUser.email);
    const nonExistingEmails: string[] = [];
    for (const email of emails) {
      if (!existingEmails.includes(email)) {
        nonExistingEmails.push(email);
      }
    }

    const registrationUrl = `${environmentConfig.CLIENT_URL}signup`;

    const sentInvitations: string[] = [];
    const alreadyRegistered: string[] = [];

    // Send emails to teammates
    for (const email of nonExistingEmails) {
      await transporter.sendMail({
        from: environmentConfig.EMAIL_USER,
        to: email,
        subject: 'Invitation to Join Team',
        html: `You have been invited to join the team! Click <a href=${registrationUrl}>here</a> to register and join the team.`,
      });
      sentInvitations.push(email);
    }

    const responseMessage: { sentInvitations?: string[], alreadyRegistered?: string[] } = {};

    if (sentInvitations.length > 0) {
      responseMessage.sentInvitations = sentInvitations;
    }

    if (existingEmails.length > 0) {
      responseMessage.alreadyRegistered = existingEmails;
    }

    let message = '';
    if (sentInvitations.length > 0) {
      message += `Invitations sent to: ${sentInvitations.join(', ')}. `;
    }
    if (existingEmails.length > 0) {
      message += `Already registered: ${existingEmails.join(', ')}. `;
    }

    if (message === '') {
      message = 'No invitations sent.';
    }

    res.status(200).json({ message: message });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
}


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
  teammates: Array<{ fullName: string; email: string }>;
}

// get teammates invited by user
export const getInvitedUser =async (req: Request, res: Response) => {
  try {
    // Get the user's ID from the decoded token
    const token = req.header("Authorization")?.replace("Bearer ", "");
    if (!token) {
      return res.status(401).json({ message: "Unauthorized" });
    }
    
    const secretKey = environmentConfig.JWT_SECRET;
    const decoded: any = jwt.verify(token, secretKey);
    const userId = decoded.userId;

    // Find teams where the user is the leadPlayer
    const invitedTeams = await Team.find({ leadPlayerId: userId });

    // Extract and flatten the invited teammates' email addresses
    const invitedTeammatesEmails = invitedTeams.map((team) => team.teammates).flat();

    // Find user details for the invited teammates
    const invitedTeammatesDetails = await user.find({ email: { $in: invitedTeammatesEmails } });

    // Create a response object with the invited teammates' details
    const response = invitedTeammatesDetails.map((teammate) => ({
      email: teammate.email,
      fullName: teammate.fullName,
      userName: teammate.userName,
    }));

    res.status(200).json(response);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
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
      const teammateEmails = team.teammates;
      const teammateDetails = await user.find({ email: { $in: teammateEmails } });

      const teammatesWithDetails = teammateDetails.map(teammate => ({
        _id: teammate._id,
        fullName: teammate.fullName, 
        email: teammate.email,
      }));

      return {
        roomUuid: team.roomUuid,
        leadPlayer: team.leadPlayer,
        teammates: teammatesWithDetails,
      };
    }));

    res.status(200).json({ code: 200, message: "Successfully retrieved registered rooms with teammates", registeredRooms });
  }  catch (error) {
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
        const teammateDetails = await user.find({ email: { $in: team.teammates } });

        const teammatesWithDetails = teammateDetails.map(teammate => ({
          _id: teammate._id,
          fullName: teammate.fullName, 
          email: teammate.email,
        }));

        return {
          roomUuid: team.roomUuid,
          leadPlayer: team.leadPlayer,
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





