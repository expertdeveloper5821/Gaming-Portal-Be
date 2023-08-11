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
    version: {
      type: String,
      required: true,
    },
    currentDateAndTime: {
      type: String,
      required: false,
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
