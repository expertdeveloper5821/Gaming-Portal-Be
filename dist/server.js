"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("./config/db");
const dotenv = __importStar(require("dotenv"));
const cors_1 = __importDefault(require("cors"));
const body_parser_1 = __importDefault(require("body-parser"));
const express_session_1 = __importDefault(require("express-session"));
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.serverPort;
const passport_1 = __importDefault(require("passport"));
// Initialize Passport middleware
app.use((0, express_session_1.default)({
    secret: "GOOOGELEDSKDJS",
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// importing routes
const userAuthRoute_1 = __importDefault(require("./routes/userAuthRoute"));
const passportRoute_1 = __importDefault(require("./routes/passportRoute"));
// cors middleware 
app.use((0, cors_1.default)({
    origin: "*",
    methods: "GET,POST,PUT,DELETE",
    credentials: true,
}));
app.use(body_parser_1.default.json());
// using middleware routes
app.use('/v1', userAuthRoute_1.default);
app.use('/auth', passportRoute_1.default);
// sample get route
app.get('/', (req, res) => {
    res.send('Hello, Gamers!');
});
// server listening
app.listen(port, () => {
    console.log(`Server is running on port ${port}...👍️`);
});
