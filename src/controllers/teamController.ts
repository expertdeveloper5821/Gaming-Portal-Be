import { user as User } from "../models/passportModels";
import { Request, Response } from "express";
import { Team } from "../models/teamModel";
import { validId } from "../utils/pattern";
import RoomId from "../models/serverRoomIDModels";
import { Transaction } from "../models/qrCodeModel";
import { userType } from '../middlewares/authMiddleware';
import { Types } from "mongoose";
import { io } from "../server";


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
        message: "Team not found",
      });
    }

    // Fetch details for each teammate using their email addresses
    const teammatesDetails = await Promise.all(
      foundTeam.teamMates.map(async (teammateId) => {
        const teammate = await User.findById(teammateId);
        if (teammate) {
          return {
            _id: teammate._id,
            fullName: teammate.fullName,
            userName: teammate.userName,
            email: teammate.email,
            profilePic: teammate.profilePic,
          };
        }
        return null;
      })
    );

    // Fetch details for the lead player
    const leadPlayer = await User.findById(foundTeam.leadPlayerId);

    // If the user is found, return the team data with teammate details as the response
    return res.status(200).json({
      data: {
        Team: {
          ...foundTeam.toObject(),
          teamMates: teammatesDetails, // Replace teamMates with teammate details
          leadPlayer: leadPlayer ? {
            fullName: leadPlayer.fullName,
            userName: leadPlayer.userName,
            email: leadPlayer.email,
            profilePic: leadPlayer.profilePic,
          } : null,
        },
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// get user team details weather he is in a team or he is a member in a team
export const getUserTeam = async (req: Request, res: Response) => {
  try {
    // Extract the user ID from the request
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    // Find the user's own team where user is a leader
    const ownTeam = await Team.findOne({ leadPlayerId: userId });

    // Find the teams where the user is a member
    const memberTeams = await Team.find({ teamMates: userId });

    // Initialize the response data
    const responseData: Record<string, any> = {};

    if (ownTeam) {
      // Fetch details for each teammate in the user's own team
      const teammatesDetails = await Promise.all(
        ownTeam.teamMates.map(async (teammateId) => {
          const teammate = await User.findById(teammateId);
          if (teammate) {
            return {
              _id: teammate._id,
              fullName: teammate.fullName,
              userName: teammate.userName,
              email: teammate.email,
              profilePic: teammate.profilePic,
            };
          }
          return null;
        })
      );

      // Fetch leadPlayerId details
      const leadPlayer = await User.findById(ownTeam.leadPlayerId);

      // response for the user's own team
      responseData.yourTeam = {
        ...ownTeam.toObject(),
        teamMates: teammatesDetails,
        leadPlayer: {
          fullName: leadPlayer?.fullName || '',
          userName: leadPlayer?.userName || '',
          email: leadPlayer?.email || '',
          profilePic: leadPlayer?.profilePic || '',
        },
      };
    }

    if (memberTeams.length > 0) {
      // response for teams where the user is a member
      responseData.youAreInTeams = await Promise.all(
        memberTeams.map(async (team) => {
          const teammatesDetails = await Promise.all(
            team.teamMates.map(async (teammateId) => {
              const teammate = await User.findById(teammateId);
              if (teammate) {
                return {
                  _id: teammate._id,
                  fullName: teammate.fullName,
                  userName: teammate.userName,
                  email: teammate.email,
                  profilePic: teammate.profilePic,
                };
              }
              return null;
            })
          );

          // Fetch leadPlayerId details for each team
          const leadPlayer = await User.findById(team.leadPlayerId);

          return {
            ...team.toObject(),
            teamMates: teammatesDetails,
            leadPlayer: {
              fullName: leadPlayer?.fullName || '',
              userName: leadPlayer?.userName || '',
              email: leadPlayer?.email || '',
              profilePic: leadPlayer?.profilePic || '',
            },
          };
        })
      );
    }

    return res.status(200).json({
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
  }
};


// get user friends list
export const getUserFriendsList = async (req: Request, res: Response) => {
  try {
    // Extract the user ID from the request
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;
    const { search, sortingKey } = req.query;

    io.emit('get-user-status', { userId });

    // Find the user's own team where the user is a leader
    const ownTeam = await Team.findOne({ leadPlayerId: userId });

    // Initialize the response data
    const responseData: Record<string, any> = {};

    if (ownTeam) {
      // Fetch leadPlayerId details
      const leadPlayer = await User.findById(ownTeam.leadPlayerId);

      // Fetch details for each teammate in the user's own team
      const teammatesDetails = await Promise.all(
        ownTeam.teamMates.map(async (teammateId) => {
          const teammate = await User.findById(teammateId);
          if (teammate) {
            return {
              _id: teammate._id,
              fullName: teammate.fullName,
              userName: teammate.userName,
              email: teammate.email,
              profilePic: teammate.profilePic,
              isOnline: teammate.isOnline
            };
          }
          return null;
        })
      );

      // Sorting teammates based on the isOnline property
      const sortAlphabetically = (a: any, b: any, order: 'asc' | 'desc') => {
        const nameA = a.fullName.toUpperCase();
        const nameB = b.fullName.toUpperCase();
        if (order === 'asc') {
          if (nameA < nameB) {
            return -1;
          }
          if (nameA > nameB) {
            return 1;
          }
        } else {
          if (nameA > nameB) {
            return -1;
          }
          if (nameA < nameB) {
            return 1;
          }
        }
        return 0;
      };

      if (search) {
        // Fetch details for each teammate in the user's own team
        const filteredTeammates = teammatesDetails.filter((teammate) => {
          return (
            (teammate?.fullName &&
              teammate.fullName.toLowerCase().includes(search.toString().toLowerCase())) ||
            (teammate?.userName &&
              teammate.userName.toLowerCase().includes(search.toString().toLowerCase())) ||
            (teammate?.email &&
              teammate.email.toLowerCase().includes(search.toString().toLowerCase()))
          );
        });
        // Sort the filtered teammates based on the sorting key
        if (sortingKey === 'onlineFirst') {
          filteredTeammates.sort((a, b) => {
            if (a?.isOnline && !b?.isOnline) return -1;
            if (!a?.isOnline && b?.isOnline) return 1;
            return 0;
          });
        } else if (sortingKey === 'offlineFirst') {
          filteredTeammates.sort((a, b) => {
            if (!a?.isOnline && b?.isOnline) return -1;
            if (a?.isOnline && !b?.isOnline) return 1;
            return 0;
          });
        } else if (sortingKey === 'AtoZ') {
          filteredTeammates.sort((a, b) => sortAlphabetically(a, b, 'asc'));
        } else if (sortingKey === 'ZtoA') {
          filteredTeammates.sort((a, b) => sortAlphabetically(a, b, 'desc'));
        }

        // Response for the searched teammates
        responseData.teamMates = filteredTeammates;
      } else {
        // Sort teammates based on the sorting key
        if (sortingKey === 'onlineFirst') {
          teammatesDetails.sort((a, b) => {
            if (a?.isOnline && !b?.isOnline) return -1;
            if (!a?.isOnline && b?.isOnline) return 1;
            return 0;
          });
        } else if (sortingKey === 'offlineFirst') {
          teammatesDetails.sort((a, b) => {
            if (!a?.isOnline && b?.isOnline) return -1;
            if (a?.isOnline && !b?.isOnline) return 1;
            return 0;
          });
        } else if (sortingKey === 'AtoZ') {
          teammatesDetails.sort((a, b) => sortAlphabetically(a, b, 'asc'));
        } else if (sortingKey === 'ZtoA') {
          teammatesDetails.sort((a, b) => sortAlphabetically(a, b, 'desc'));
        }

        // No search query, include team details
        responseData.yourTeam = {
          teamName: ownTeam.teamName,
          leadPlayer: {
            fullName: leadPlayer?.fullName || '',
            userName: leadPlayer?.userName || '',
            email: leadPlayer?.email || '',
            profilePic: leadPlayer?.profilePic || '',
            isOnline: leadPlayer?.isOnline || ''
          },
        };

        responseData.yourTeam.teamMates = teammatesDetails;
      }
    } else {
      // If the user doesn't have their own team, return an error
      return res
        .status(403)
        .json({ message: 'You do not have your own team.', success: false });
    }

    return res.status(200).json({
      data: responseData,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};


// add teammates into match 
export const addTeammatesIntoMatch = async (req: Request, res: Response) => {
  try {
    const { emails, leaderEmail, roomid } = req.body; // Use "roomid" instead of "roomId"

    // validate that no more than 3 email addresses are provided
    if (emails.length > 3) {
      return res.status(400).json({ message: 'You cannot add only 3 friends in this room' });
    }

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
    // Fetch all teams
    const teams = await Team.find();

    // Fetch details for each team, including teammate and lead player details
    const teamDetails = await Promise.all(
      teams.map(async (team) => {
        // Fetch details for each teammate using their email addresses
        const teammatesDetails = await Promise.all(
          team.teamMates.map(async (teammateId) => {
            const teammate = await User.findById(teammateId);
            if (teammate) {
              return {
                _id: teammate._id,
                fullName: teammate.fullName,
                userName: teammate.userName,
                email: teammate.email,
                profilePic: teammate.profilePic,
              };
            }
            return null;
          })
        );

        // Fetch details for the lead player
        const leadPlayer = await User.findById(team.leadPlayerId);

        return {
          _id: team._id,
          teamName: team.teamName,
          teamMates: teammatesDetails, // Replace teamMates with teammate details
          leadPlayer: leadPlayer ? {
            _id: leadPlayer._id,
            fullName: leadPlayer.fullName,
            userName: leadPlayer.userName,
            email: leadPlayer.email,
            profilePic: leadPlayer.profilePic,
          } : null,
        };
      })
    );

    // Return the list of team details
    return res.status(200).json({
      data: {
        teams: teamDetails,
      },
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
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
        message: "Team not found",
      });
    }

    // If the user is updated successfully, return the updated user data as the response
    return res.status(200).json({
      data: updatedTeam,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
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
        message: "Team not found",
      });
    }

    // If the user is deleted successfully, return the deletion result as the response
    return res.status(200).json({
      message: "deleted successfully",
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: "Internal server error" });
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
          createdAt: transaction.createdAt,
        };
      })
    );

    // Filter out null entries from detailedRooms
    const filteredRooms = detailedRooms.filter(room => room !== null);

    // Sort the filteredRooms by createdAt in descending order
    filteredRooms.sort((a, b) => (b!.createdAt.getTime() - a!.createdAt.getTime()));

    res.status(200).json({
      message: 'Rooms details retrieved successfully',
      numberOfRooms: filteredRooms.length,
      rooms: filteredRooms,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal Server Error' });
  }

};


// get user regiseter game with teammates
export const getUserRegisteredRoomsWithTeamMates = async (req: Request, res: Response) => {
  try {
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;
    const { roomUuid } = req.params;

    // Find the room details based on roomUuid
    const roomDetails = await RoomId.findOne({ roomUuid });

    if (!roomDetails) {
      return res.status(404).json({ message: 'Room not found' });
    }

    // Find the user's team that has registered for this room
    const userTeam = await Team.findOne({ roomUuid, leadPlayerId: userId });

    if (!userTeam) {
      return res.status(404).json({ message: 'User is not registered for this room' });
    }

    // Prepare the response data with user details
    const teamLeader = await User.findById(userTeam.leadPlayerId);

    const teamMembers = await User.find({ _id: { $in: userTeam.teamMates } });

    const userRegisteredGame = {
      teamName: userTeam.teamName,
      leader: {
        id: teamLeader?._id || '',
        fullName: teamLeader?.fullName || '',
        userName: teamLeader?.userName || '',
        email: teamLeader?.email || '',
        profilePic: teamLeader?.profilePic || '',
      },
      teammates: teamMembers.map((teammate) => ({
        id: teammate._id,
        fullName: teammate.fullName || '',
        userName: teammate.userName || '',
        email: teammate.email || '',
        profilePic: teammate.profilePic || '',
      })),
      gameDetails: {
        roomUuid: roomDetails.roomUuid,
        gameType: roomDetails.gameType || '',
        gameName: roomDetails.gameName || '',
        mapType: roomDetails.mapType || '',
      },
    };

    res.status(200).json({ data: userRegisteredGame });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


// get user all register room details with teamMates
export const getAllUserRegisterRoomWithTeam = async (req: Request, res: Response) => {
  try {
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    // Find all teams where the user is either the lead player or a teammate
    const userTeams = await Team.find({ $or: [{ leadPlayerId: userId }, { teamMates: userId }] });

    // Initialize an array to store all user's registered games with room details and teammates
    const userRegisteredGames = [];

    // Iterate through user's teams to fetch game details and teammates for each team
    for (const userTeam of userTeams) {
      const roomDetails = await RoomId.find({ roomUuid: userTeam.roomUuid });
      // console.log("tis is room",roomDetails);

      if (roomDetails) {
        const teamLeader = await User.findById(userTeam.leadPlayerId);
        const teamMembers = await User.find({ _id: { $in: userTeam.teamMates } });

        const userRegisteredGame = {
          teamName: userTeam.teamName,
          leader: {
            id: teamLeader?._id || '',
            fullName: teamLeader?.fullName || '',
            userName: teamLeader?.userName || '',
            email: teamLeader?.email || '',
            profilePic: teamLeader?.profilePic || '',
          },
          gameDetails: roomDetails.map((detail) => {
            return {
              roomUuid: detail.roomUuid,
              gameType: detail.gameType || '',
              gameName: detail.gameName || '',
              mapType: detail.mapType || '',
              teammates: teamMembers.map((teammate) => ({
                id: teammate._id,
                fullName: teammate.fullName || '',
                userName: teammate.userName || '',
                email: teammate.email || '',
                profilePic: teammate.profilePic || '',
              })),
            };
          }),
        };

        userRegisteredGames.push(userRegisteredGame);
      }
    }

    res.status(200).json({ data: userRegisteredGames });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Internal server error' });
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
        userName: teammate.userName,
        email: teammate.email,
        profilePic: teammate.profilePic
      }));

      const leaderDetails = await User.findById(team.leadPlayerId);

      return {
        teamName: team.teamName,
        leadPlayer: {
          fullName: leaderDetails ? leaderDetails.fullName : '',
          userName: leaderDetails ? leaderDetails.userName : '',
          email: leaderDetails ? leaderDetails.email : '',
          profilePic: leaderDetails ? leaderDetails.profilePic : '',
        },
        teammates: teammatesWithDetails,
      };
    }));

    res.status(200).json({ numberOfTeams: teamsInRoom.length, roomUuid, data: userAndTeams });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};


// remove user in team
export const removeUserInTeam = async (req: Request, res: Response) => {
  try {
    const user = req.user as userType; // Type assertion to userType

    if (!user) {
      return res.status(401).json({ message: 'You are not authenticated!', success: false });
    }

    const userId = user.userId;

    // Parse the email from the request body
    const { teammateEmail } = req.body;

    if (!teammateEmail) {
      return res.status(400).json({ message: 'Teammate email is required.', success: false });
    }

    // Find the user by email to get their ID
    const teammate = await User.findOne({ email: teammateEmail });

    if (!teammate) {
      return res.status(404).json({ message: 'Teammate not found.', success: false });
    }

    // Find your team using your user ID as leadPlayerId
    const yourTeam = await Team.findOne({ leadPlayerId: userId });

    if (!yourTeam) {
      return res.status(404).json({ message: 'Your team not found.', success: false });
    }

    // Remove the teammate's ID from your team's teamMates array
    yourTeam.teamMates = yourTeam.teamMates.filter(teammateId => teammateId.toString() !== teammate._id.toString());

    // Save the updated team document
    await yourTeam.save();

    return res.status(200).json({ message: 'Teammate removed successfully.', success: true });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Internal server error' });
  }

}

