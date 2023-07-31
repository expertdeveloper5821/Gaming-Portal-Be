"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("./config/db");
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
const passport_1 = __importDefault(require("passport"));
const corsConfig_1 = require("./config/corsConfig");
const app = (0, express_1.default)();
// Initialize Passport middleware
const sessionSecret = process.env.sessionSecret || "defaultSecret";
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// importing routes
const userAuthRoute_1 = __importDefault(require("./routes/userAuthRoute"));
const passportRoute_1 = __importDefault(require("./routes/passportRoute"));
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
// cors middleware 
app.use((0, corsConfig_1.configureCors)());
// accept body middleware
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: true }));
app.use(express_1.default.urlencoded({ extended: false }));
// using middleware routes
app.use('/v1', userAuthRoute_1.default);
app.use('/auth', passportRoute_1.default);
app.use('/v2', protectedRoutes_1.default);
exports.default = app;
