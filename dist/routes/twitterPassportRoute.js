"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const route = express_1.default.Router();
const passport_1 = __importDefault(require("passport"));
require("../modules/twitterPasport");
route.get('/twitter', passport_1.default.authenticate('twitter', { scope: ['email', 'profile'] }));
route.get('/twitter/callback', passport_1.default.authenticate('twitter', { failureRedirect: '/login' }), function (req, res) {
    // Successful authentication, redirect home.
    res.redirect('/');
});
exports.default = route;
