import mongoose, { Schema } from "mongoose";

const winnerPlayersSchema: Schema = new Schema(
  {
    winnerUuid: {
      type: String,
      required: false,
    },
    teamData: [
      {
        teamName: {
          type: String,
          required: true,
        },
        highestKill: {
          type: Number,
          required: false,
        },
        chickenDinner: {
          type: Number,
          required: false,
        },
      },
    ],
    roomId: {
      type: String,
      required: false,
    },
    createdBy: {
      type: String,
      required: false,
    },
  },
  { timestamps: true }
);

const WinnerPlayers = mongoose.model("WinnerPlayer", winnerPlayersSchema);
export default WinnerPlayers;
