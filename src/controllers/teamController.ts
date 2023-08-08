import { user } from "../models/passportModels";
import { Request, Response } from "express";
import { environmentConfig } from "../config/environmentConfig";
import { transporter } from "../middlewares/email";
import { Team } from "../models/teamModel";
import { validId } from "../utils/pattern";
import RoomId from "../models/serverRoomIDModels";

// add players
export const addTeammates = async (req: Request, res: Response) => {
  try {
    const {
      emails,
      id,
      leadPlayer,
    }: { emails: string[]; leadPlayer: string; id: string } = req.body;
    if (!emails || !Array.isArray(emails)) {
      return res.status(400).json({ error: "Invalid input format" });
    }
    const teamData = await RoomId.findOne({ uuid: id });

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
        const newTem = new Team({
          leadPlayer: leadPlayer,
          uuid: teamData?.uuid,
          teammates: emails,
        });
        await newTem.save();
        res.status(200).json({
          code: 200,
          message: `Teammates added Successfully`,
          registeredEmails,
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
    const uuids = allTeams.map((team) => team.uuid);

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

    // If teams are found, construct the response data
    const responseData = allTeams.map((team) => ({
      uuid: team.uuid,
      leadPlayer: team.leadPlayer,
      teammates: team.teammates,
      registeredGame: gameInfoMap[team.uuid], // Retrieve game info using the map
    }));

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
    // Use the findById method to find the user by their ID in the database
    const foundTeam = await Team.findById(TeamId);
    const gameInfo = await RoomId.findOne({ uuid: foundTeam?.uuid });

    if (!foundTeam) {
      return res.status(404).json({
        code: 404,
        message: "Team not found",
      });
    }

    // If the user is found, return the user data as the response
    return res.status(200).json({
      code: 200,
      data: {
        Team: foundTeam,
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
