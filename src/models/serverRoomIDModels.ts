import mongoose, { Schema } from "mongoose";

const roomIdSchema: Schema = new Schema(
  {
    roomUuid: {
      type: String,
      required: false,
    },
    roomId: {
      type: String,
      required: false,
    },
    password: {
      type: String,
      required: false,
    },
    gameName: {
      type: String,
      required: false,
    },
    gameType: {
      type: String,
      required: false,
    },
    mapType: {
      type: String,
      required: false,
    },
    mapImg: {
      type: String,
      required: false,
    },
    version: {
      type: String,
      required: false,
    },
    dateAndTime: {
      type: Date,
      required: false,
    },
    entryFee: {
      type: String,
      required: false,
    },
    lastSurvival: {
      type: String,
      required: false,
    },
    highestKill: {
      type: String,
      required: false,
    },
    secondWin: {
      type: String,
      required: false,
    },
    thirdWin: {
      type: String,
      required: false,
    },
    createdBy: {
      type: String, 
      required: true,
    },
  },
  { timestamps: true }
);

const RoomId = mongoose.model("RoomId", roomIdSchema);
export default RoomId;