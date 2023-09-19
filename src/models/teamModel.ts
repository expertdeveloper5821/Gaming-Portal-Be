import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  roomUuid: { type: String, required: false },
  teamMates: {
    type: [String],
  },
  leadPlayerId: { type: mongoose.Schema.Types.ObjectId, ref: 'user' }, 
  teamName: { type: String, required: false },
  registeredRooms: [
    {
      roomid: String,
      teammates: [String], // Array of teammate email addresses
    },
  ],
});

export const Team = mongoose.model("Team", TeamSchema);

