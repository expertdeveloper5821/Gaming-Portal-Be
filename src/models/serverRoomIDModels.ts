import mongoose, { Schema } from "mongoose";

const roomIdSchema: Schema = new Schema(
  {
    roomId: {
      type: Number,
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
    gameTiming: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

const RoomId = mongoose.model("RoomId", roomIdSchema);

export default RoomId;
