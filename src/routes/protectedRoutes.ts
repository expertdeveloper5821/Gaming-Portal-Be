// adminRoutes.ts
import express from 'express';
import { adminSignup, role, getRoleById, spectator, getAllRole, updateRole, deleteRole } from '../controllers/adminController';
import { verifyToken } from '../middlewares/authMiddleware';

const route = express.Router();

// create Role 
route.post('/role', role);

// create admin
route.post('/admin/Register',  adminSignup);

// Spectator Register - Only 'admin' token is allowed
route.post('/spectator/Register', verifyToken('admin'), spectator);

// get All Role - Only 'admin' token is allowed
route.get('/getAllRole', verifyToken('admin'), getAllRole);

// getRole by Id - Only 'admin' token is allowed
route.get('/getRole/:id', verifyToken('admin'), getRoleById);

// update Role - Only 'superadmin' token is allowed
route.put('/updaterole/:id', verifyToken('admin'), updateRole);

// delete Role - Only 'superadmin' token is allowed
route.delete('/deleterole/:id', verifyToken('admin'), deleteRole);

export default route;
