import mongoose, { Schema } from "mongoose";

const winnerPlayersSchema: Schema = new Schema(
  {
    winnerUuid: {
      type: String,
      required: true,
    },
    winnerName: {
      type: String,
      required: true,
    },
    winningPosition: {
      type: String,
      required: true,
    },
    uuid: {
      type: String,
      required: true,
    },
    createdBy: {
      type: String, // Assuming the user ID is a string
      required: true,
    },
  },
  { timestamps: true }
);

const WinnerPlayers = mongoose.model("WinnerPlayer", winnerPlayersSchema);
export default WinnerPlayers;
