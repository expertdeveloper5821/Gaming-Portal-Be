import mongoose from "mongoose";

let userRegisterSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  userName: { type: String, required: true },
  email: { type: String, required: true },
  password: { type: String, required: false },
  provider: {type: String, required:false},
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'Role', require:'false'},
});

export const user = mongoose.model("user", userRegisterSchema);

