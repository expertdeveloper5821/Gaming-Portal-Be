import express from "express";
import {
  userSignup,
  userLogin,
  forgetPassword,
  userUpdate,
  userDelete,
  resetPassword,
  getUserDetails,
  getAllUsers,
  sendInviteMail,
  sendEmailToUser,
  acceptInvitation
} from "../controllers/userController";
const route = express.Router();
import { verifyToken } from "../middlewares/authMiddleware";
import multer from 'multer';
import bodyParser from "body-parser";



route.use(bodyParser.json());
route.use(bodyParser.urlencoded({ extended: true }));


const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    const name = Date.now() + '_' + file.originalname;
    cb(null, name);
  }
});

const upload = multer({ storage: storage });

route.post("/send-email", sendEmailToUser);

// signup route
route.post("/signup", userSignup);

// login route
route.post("/login", userLogin);

// forgetPassword route
route.post("/forget-password", forgetPassword);

// resetPassword route
route.post("/reset-password", resetPassword);

// get single user 
route.get("/getuser", getUserDetails);

// get Alluser
route.get("/getalluser", verifyToken(["admin", 'spectator']), getAllUsers);

// update user 
route.put("/updateuser", upload.single('profilePic'), verifyToken(["admin", 'user']), userUpdate);

// delete by id
route.delete("/deleteuser", verifyToken(["admin", 'user']), userDelete);

// post send invite mail
route.post("/send-invite", verifyToken(["user"]), sendInviteMail)

// post accept invite mail
route.post("/accept-invite", verifyToken(["user"]), acceptInvitation)


export default route;
