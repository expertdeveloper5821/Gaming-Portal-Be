import express from 'express'
import { userSignup, userLogin, forgetPassword, resetPassword} from "../controllers/userController";
const route = express.Router();

route.post('/signup', userSignup)
route.post('/login', userLogin)
route.post('/forget-password', forgetPassword)
route.post('/reset-password', resetPassword)
 export default route;