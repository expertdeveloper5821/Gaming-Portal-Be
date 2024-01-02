import mongoose, { Schema } from "mongoose";

const teamDataSchema = new Schema({
  teamName: {
    type: String,
    required: false,
  },
  highestKill: {
    type: Number,
    required: false,
  },
  chickenDinner: {
    type: Number,
    required: false,
  },
  firstWinner: {
    type: Number,
    required: false,
  },
  secondWinner: {
    type: Number,
    required: false,
  },
});

const winnerPlayersSchema = new Schema({
  winnerUuid: {
    type: String,
    required: false,
  },
  teamData: [teamDataSchema],
  roomId: {
    type: String,
    required: false,
  },
  createdBy: {
    type: String,
    required: false,
  },
}, { timestamps: true });

const WinnerPlayers = mongoose.model("WinnerPlayer", winnerPlayersSchema);
export default WinnerPlayers;
