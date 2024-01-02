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

        // Check if the room is already assigned to any user
        const existingAssignment = await RoomId.findOne({
            _id: roomid,
            assignTo: { $ne: null } // Check if the assignTo field is not null (i.e., already assigned)
        });

        if (existingAssignment) {
            // Find the user with the specified fullName (assignTo)
            const assignedUser = await user.findOne({ fullName: { $regex: new RegExp('^' + assignTo + '$', 'i') } });

            // If the user is not found, return a 404 response
            if (!assignedUser) {
                return res.status(404).json({ message: 'User not found' });
            }
            // Check if the room is already assigned to the specified user
            if (existingAssignment.assignTo.equals(assignedUser._id)) {
                return res.status(400).json({ message: 'This room is already assigned to this spectator.' });
            }

            // Update the room assignment to the specified user
            const assignment = await RoomId.findOneAndUpdate({ _id: roomid }, { assignTo: assignedUser._id }, { new: true });

            // If the update fails,
            if (!assignment) {
                return res.status(200).json({ message: 'Failed to assign a room' });
            } else {
                // Retrieve user information from the token
                const user = req.user as userType;
                const senderFullName = user.fullName;

                // Retrieve email and room information for sending the email
                const userEmail = assignedUser.email;
                const roomData = assignment.toObject();

                // Format date and time
                const formattedDateAndTime = moment(roomData.dateAndTime).format("DD-MM-YYYY h:mm A");
                const dateTimeFormat = formattedDateAndTime.split(" ");
                const date = dateTimeFormat[0];
                const time = dateTimeFormat[1];
                const dayTime = dateTimeFormat[2];

                // Replace placeholders in the email template with actual data
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

                // Send email to the assigned user
                const mailOptions = {
                    from: environmentConfig.EMAIL_USER,
                    to: userEmail,
                    subject: "Room Assign",
                    html: emailContent
                }
                transporter.sendMail(mailOptions, (err) => {
                    if (err) {
                        return res.status(500).json({ message: 'Failed to send the email for assigning a room' });
                    } else {
                        return res.status(200).json({ message: 'Room assigned to spectator successfully. Email sent to assigned user.' });
                    }
                })
            }
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


