import express, { Request, Response } from "express";
import RoomId from "../models/serverRoomIDModels";
import { user } from "../models/passportModels";
import { environmentConfig } from "../config/environmentConfig";
import { transporter } from "../middlewares/email";
import { userType } from "../middlewares/authMiddleware";
import moment from 'moment-timezone';
import fs from 'fs';
import path from 'path';
const router = express.Router();
router.use(express.static('public'));



// get spacatator
export const getSpacatator = async (req: Request, res: Response) => {
    try {
        // role _id in params
        const { role } = req.params;

        // finding user and populate the role wiht name and email field
        const findSpacatator = await user
            .find({ role: role })
            .populate({
                path: 'role',
                select: '_id role',
            })
            .select('_id fullName email role');

        return res.status(200).json({ findSpacatator });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// Read the mail template HTML from the file
const mailTemplatePath = path.join(__dirname, '../public/assign-template/assign.html');
const mailTemplate = fs.readFileSync(mailTemplatePath, 'utf-8');


// Assign room to other spactator
export const assignToOtherSpectator = async (req: Request, res: Response) => {
    try {

        const { roomid, assignTo } = req.body;

        const existingAssignment = await RoomId.findById(roomid);

        if (existingAssignment && existingAssignment.status === 'accepted' && existingAssignment.assignTo !== null) {
            return res.status(400).json({ message: 'This room is already assigned to this spectator.' });
        }

        if (existingAssignment && (existingAssignment.status === 'pending' || existingAssignment.status === 'rejected') && (existingAssignment.assignTo === null)) {
            const assignedUser = await user.findOne({ email: { $regex: new RegExp('^' + assignTo + '$', 'i') } });

            if (!assignedUser) {
                return res.status(404).json({ message: 'User not found' });
            }

            const assignment = await RoomId.findById({ _id: roomid });

            if (!assignment) {
                return res.status(200).json({ message: 'Failed to assign a room' });
            } else {
                const user = req.user as userType;
                const senderFullName = user.fullName;
                const userEmail = assignedUser.email;
                const roomData = assignment.toObject();
                const formattedDateAndTime = moment(roomData.dateAndTime).format("DD-MM-YYYY h:mm A");
                const dateTimeFormat = formattedDateAndTime.split(" ");
                const date = dateTimeFormat[0];
                const time = dateTimeFormat[1];
                const dayTime = dateTimeFormat[2];
                const roomInvitationLink = `${environmentConfig.CLIENT_URL}?roomid=${roomid}&assignTo=${assignedUser._id}`;
                const emailContent = mailTemplate
                    .replace('{{senderFullName}}', senderFullName)
                    .replace('{{roomId}}', roomData.roomId)
                    .replace('{{password}}', roomData.password)
                    .replace('{{gameName}}', roomData.gameName)
                    .replace('{{gameType}}', roomData.gameType)
                    .replace('{{mapType}}', roomData.mapType)
                    .replace('{{version}}', roomData.version)
                    .replace('{{date}}', date)
                    .replace('{{time}}', `${time} ${dayTime}`)
                const mailOptions = {
                    from: environmentConfig.EMAIL_USER,
                    to: userEmail,
                    subject: "Room Assign",
                    html: `${emailContent} <b>Click the following link to accept or reject the invitation:-</b> <a href=${roomInvitationLink}>Click Here</a>`
                }
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to send the email for assigning a room' });
                    } else {
                        return res.status(200).json({ message: 'Email sent to assigned user.' });
                    }
                })
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


// acceptRoomAssignment api
export const acceptRoomAssignment = async (req: Request, res: Response) => {
    try {
        const { roomid, assignTo } = req.query;

        // Find the room with the specified ID
        const room = await RoomId.findById({ _id: roomid });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const updatedRoom = await RoomId.findByIdAndUpdate(
            { _id: roomid },
            {
                $set: {
                    status: 'accepted',
                    assignTo: assignTo
                }
            },
            { new: true })

        return res.status(200).json({ message: 'Invitaion accepted...' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


export const rejectRoomAssignment = async (req: Request, res: Response) => {
    try {
        const { roomid, assignTo } = req.query;

        // Find the room with the specified ID
        const room = await RoomId.findById({ _id: roomid });

        if (!room) {
            return res.status(404).json({ message: 'Room not found' });
        }

        const updatedRoom = await RoomId.findByIdAndUpdate(
            { _id: roomid },
            {
                $set: {
                    status: 'rejected',
                }
            },
            { new: true })

        return res.status(200).json({ message: 'Invitaion rejected... ' });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};