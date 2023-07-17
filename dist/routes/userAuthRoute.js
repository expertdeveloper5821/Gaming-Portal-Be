"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const route = express_1.default.Router();
route.post('/signup', userController_1.userSignup);
route.post('/login', userController_1.userLogin);
route.post('/forget-password', userController_1.forgetPassword);
route.post('/reset-password', userController_1.resetPassword);
exports.default = route;
