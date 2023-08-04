import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  gameName: { type: String, required: true },
  mapType: { type: String, required: true },
  gameType: { type: String, required: true },
  leadPlayer: { type: String, required: true },
  teammates: {
    type: [String],
  }
});

export const Team = mongoose.model("Team", TeamSchema);
