import mongoose, { Schema } from "mongoose";

const roomIdSchema: Schema = new Schema(
  {
    roomId: {
      type: Number,
      required: true,
    },
  },
  { timestamps: true }
);

const RoomId = mongoose.model("RoomId", roomIdSchema);

export default RoomId;
