import express from 'express'
import { userSignup, userLogin, forgetPassword, resetPassword} from "../controllers/userController";
const route = express.Router();


// signup route
route.post('/signup', userSignup)

// login route
route.post('/login', userLogin)

// forgetPassword route
route.post('/forget-password', forgetPassword)

// resetPassword route
route.post('/reset-password', resetPassword)

 export default route;