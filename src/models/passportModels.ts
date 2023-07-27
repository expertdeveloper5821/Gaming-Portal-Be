import mongoose from "mongoose";

// user model
let userRegisterSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  provider: {type: String, required:false}
});


export const user = mongoose.model("user", userRegisterSchema);
