import express from 'express'
import {adminController} from "../controllers/userController";
import requireRole from '../middlewares/authMiddleware';
const route = express.Router();

route.post('/admin', requireRole('admin'), adminController)
 export default route;