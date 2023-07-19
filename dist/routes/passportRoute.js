"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
require("../modules/passport");
route.get('/google', passport_1.default.authenticate('google', { scope: ['email', 'profile'] }));
route.get('/google/callback', passport_1.default.authenticate('google', { failureRedirect: '/login' }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
exports.default = route;
