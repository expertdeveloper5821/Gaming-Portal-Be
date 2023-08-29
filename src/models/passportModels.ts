import mongoose from "mongoose";

let userRegisterSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  provider: { type: String, required: false },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', require: 'false' },
  userUuid: { type: String, required: false },
  upiId: { type: String, required: false },
  phoneNumber: { type: Number, required: false },
  teamName: { type: String, required: false },
  profilePic: { type: String, required: false }
});

export const user = mongoose.model("user", userRegisterSchema);

