import mongoose from "mongoose";

let userRegisterSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: false },
  email: { type: String, required: true },
  password: { type: String, required: false },
  provider: { type: String, required: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: 'false' },
  userUuid: { type: String, required: false },
  upiId: { type: String, required: false },
  phoneNumber: { type: String, required: false },
  profilePic: { type: String, required: false },
  bgmiId: { type: String, required: false },
  isOnline: { type: Boolean, default: false },
});

export const user = mongoose.model("user", userRegisterSchema);

