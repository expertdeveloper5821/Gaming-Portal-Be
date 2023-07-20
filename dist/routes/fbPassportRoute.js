"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
require("../modules/fbPassport");
route.get('/facebook', passport_1.default.authenticate('facebook', { scope: ['email', 'profile'] }));
route.get('/facebook/callback', passport_1.default.authenticate('facebook', { failureRedirect: '/login' }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
exports.default = route;
