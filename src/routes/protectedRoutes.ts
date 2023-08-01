import express from "express";
import {
  adminSignup,
  role,
  getRoleById,
  spectator,
  getAllRole,
  updateRole,
  deleteRole,
} from "../controllers/adminController";
const route = express.Router();

// create Role
route.post("/role", role);

// Admin Register
route.post("/admin/Register", adminSignup);

// Spectator Register
route.post("/spectator/Register", spectator);

// get All Role
route.get("/getAllRole", getAllRole);

// getRole by Id
route.get("/getRole/:id", getRoleById);

// update Role
route.put("/updaterole/:id",updateRole)

// delete Role
route.delete("/deleterole/:id",deleteRole)

export default route;
