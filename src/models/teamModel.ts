import mongoose from "mongoose";

const TeamSchema = new mongoose.Schema({
  uuid: { type: String, required: true },
  leadPlayer: { type: String, required: true },
  teammates: {
    type: [String],
  },
});

export const Team = mongoose.model("Team", TeamSchema);

