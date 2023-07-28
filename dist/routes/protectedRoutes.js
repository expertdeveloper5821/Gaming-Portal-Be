"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const route = express_1.default.Router();
route.post('/role', adminController_1.role);
route.post('/admin/Register', adminController_1.adminSignup);
route.post('/spectator/Register', adminController_1.spectatorSignup);
route.get('/getRole/:id', adminController_1.getRoleById);
exports.default = route;
