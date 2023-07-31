import express from "express";
import {
  adminSignup,
  role,
  getRoleById,
  spectator,
  getAllRole,
} from "../controllers/adminController";
const route = express.Router();

// create Role
route.post("/role", role);

// Admin Register
route.post("/admin/Register", adminSignup);

// Spectator Register
route.post("/spectator/Register", spectator);

// getRole by Id
route.get("/getRole/:id", getRoleById);

// get All Role
route.get("/getAllRole", getAllRole);

export default route;
