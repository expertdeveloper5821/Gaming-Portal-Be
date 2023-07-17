import mongoose from "mongoose";

let userRegisterSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
});

export const user = mongoose.model("user", userRegisterSchema);
