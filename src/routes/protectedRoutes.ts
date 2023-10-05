// adminRoutes.ts
import express from "express";
import {
  adminSignup,
  role,
  getRoleById,
  spectator,
  getAllRole,
  updateRole,
  deleteRole,
  video,
  getAllVideoLink,
  getVideoById,
  updateVideoById,
  deleteVideoById,
} from "../controllers/adminController";
import { verifyToken } from "../middlewares/authMiddleware";

const route = express.Router();

// create Role
route.post("/role", role);

// create admin
route.post("/admin/Register", adminSignup);

// Spectator Register - Only 'admin' token is allowed
route.post("/spectator/Register", verifyToken(["admin"]), spectator);

// get All Role - Only 'admin' token is allowed
route.get("/getAllRole", verifyToken(["admin"]), getAllRole);

// getRole by Id - Only 'admin' token is allowed
route.get("/getRole/:id", verifyToken(["admin"]), getRoleById);

// update Role - Only 'admin' token is allowed
route.put("/updaterole/:userUuid", verifyToken(["admin"]), updateRole);

// delete Role - Only 'admin' token is allowed
route.delete("/deleterole/:userUuid", verifyToken(["admin"]), deleteRole);

// to post the video link and information
route.post("/videolink/:roomId", verifyToken(["admin",'spectator']), video);

// to get all video link and information
route.get("/allvideolink", verifyToken(["admin",'spectator','user']), getAllVideoLink);

// get video by ID
route.get("/getvideo/:id", verifyToken(["admin",'spectator','user']), getVideoById);

// updatevideo by id
route.put("/updatevideo/:id", verifyToken(["admin",'spectator']), updateVideoById);

//  delete video by id
route.delete("/deletevideo/:id", verifyToken(["admin",'spectator']), deleteVideoById);

export default route;
    