import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  roomUuid: { type: String, required: true },
  leadPlayer: { type: String, required: true },
  teammates: {
    type: [String],
  },
  leadPlayerId: { type: String, required: false},
  teamDetails: { type: String, required: false}
});

export const Team = mongoose.model("Team", TeamSchema);

