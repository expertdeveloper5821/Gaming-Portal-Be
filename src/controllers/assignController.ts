import { Request, Response } from "express";
import RoomId from "../models/serverRoomIDModels";
import { user } from "../models/passportModels";



// get spacatator
export const getSpacatator = async (req: Request, res: Response) => {
    try {
        const { role } = req.params;
        const findSpacatator = await user
            .find({ role: role })
            .populate({
                path: 'role',
                select: '_id role',
            })
            .select('_id fullName role');

        return res.status(200).json({ findSpacatator });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};




export const assignToOtherSpectator = async (req: Request, res: Response) => {
    try {
        const { roomid, assignTo } = req.body;

        const assignedUser = await user.findOne({ fullName: { $regex: new RegExp('^' + assignTo + '$', 'i') } });

        if (!assignedUser) {
            return res.status(404).json({ message: 'User not found' });
        }

        const assignment = await RoomId.findOneAndUpdate({ _id: roomid }, { assignTo: assignedUser._id }, { new: true });

        if (!assignment) {
            return res.status(200).json({ message: 'Failed to assign a room' });
        } else {
            return res.status(200).json({ message: 'Room assigned to spectator successfully' });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


