import mongoose from "mongoose";

let roleSchema = new mongoose.Schema({
  role: [{ type: String,enum:['admin','user','spectator'], default:'user', require:'false'}]
});

export const Role = mongoose.model("Role", roleSchema);

