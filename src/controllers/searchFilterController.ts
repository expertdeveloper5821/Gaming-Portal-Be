import { Request, Response } from "express";
import { user } from "../models/passportModels";
import RoomId from "../models/serverRoomIDModels";



// search all user
export const searchAllUser = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const items = await user.aggregate([
            {
                $lookup: {
                    from: 'roles',
                    localField: 'role',
                    foreignField: '_id',
                    as: 'roleData',
                },
            },
            {
                $match: {
                    $or: [
                        { fullName: { $regex: query, $options: 'i' } },
                        { userName: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                        { 'roleData.role': { $regex: query, $options: 'i' } },
                    ],
                },
            },
        ]);

        // Check if no data was found
        if (items.length === 0) {
            return res.status(404).json({ message: 'No data found with this keyword.' });
        }

        res.json(items);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}

// search all rooms
export const searchAllRooms = async (req: Request, res: Response) => {
    try {
        const { query } = req.query;
        const roomsItems = await RoomId.find({
            $or: [
                { roomId: { $regex: query, $options: 'i' } },
                { password: { $regex: query, $options: 'i' } },
                { gameName: { $regex: query, $options: 'i' } },
                { gameType: { $regex: query, $options: 'i' } },
                { mapType: { $regex: query, $options: 'i' } },
                { version: { $regex: query, $options: 'i' } },
                { time: { $regex: query, $options: 'i' } },
                { date: { $regex: query, $options: 'i' } },
                { lastServival: { $regex: query, $options: 'i' } },
                { highestKill: { $regex: query, $options: 'i' } },
                { secondWin: { $regex: query, $options: 'i' } },
                { thirdWin: { $regex: query, $options: 'i' } },
            ],
        });
        // Check if no data was found
        if (roomsItems.length === 0) {
            return res.status(404).json({ message: 'No data found with this keyword.' });
        }
        res.json(roomsItems);
    } catch (error) {
        res.status(500).json({ error: 'An error occurred' });
    }
}