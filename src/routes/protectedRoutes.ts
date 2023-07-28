import express from 'express'
import { adminSignup,role,getRoleById,spectator } from '../controllers/adminController';
const route = express.Router();

route.post('/role', role)
route.post('/admin/Register', adminSignup)
route.post('/spectator/Register', spectator)
route.get('/getRole/:id', getRoleById)

 export default route;