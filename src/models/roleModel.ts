import mongoose from "mongoose";

let roleSchema = new mongoose.Schema({
  role: { type: String,enum:['admin','user','spectator'], default:'user', require:true},
  uuid: { type: String, required:true}
});

export const Role = mongoose.model("Role", roleSchema);

