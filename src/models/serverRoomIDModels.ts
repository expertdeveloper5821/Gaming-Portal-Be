import mongoose, { Schema } from "mongoose";

const roomIdSchema: Schema = new Schema(
  {
    uuid: {
      type: String,
      required: true,
    },
    roomId: {
      type: String,
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    gameName: {
      type: String,
      required: true,
    },
    gameType: {
      type: String,
      required: true,
    },
    mapType: {
      type: String,
      required: true,
    },
    mapImg: {
      type: String,
      required: false,
    },
    version: {
      type: String,
      required: true,
    },
    time: {
      type: String,
      required: true,
    },
    date: {
      type: String,
      required: true,
    },
    lastServival: {
      type: String,
      required: true,
    },
    highestKill: {
      type: String,
      required: true,
    },
    secondWin: {
      type: String,
      required: true,
    },
    thirdWin: {
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

const RoomId = mongoose.model("RoomId", roomIdSchema);
export default RoomId;
