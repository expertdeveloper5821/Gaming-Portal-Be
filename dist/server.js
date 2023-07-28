"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
require("./config/db");
const environmentConfig_1 = require("./config/environmentConfig");
const corsConfig_1 = require("./config/corsConfig");
const passport_1 = __importDefault(require("passport"));
const express_session_1 = __importDefault(require("express-session"));
const body_parser_1 = __importDefault(require("body-parser"));
const { authenticateJWT, authorizeRole } = require('./middlewares/authMiddleware');
const app = (0, express_1.default)();
const port = environmentConfig_1.environmentConfig.SERVER_PORT;
// Initialize Passport middleware
const sessionSecret = environmentConfig_1.environmentConfig.SESSION_SECRET;
app.use((0, express_session_1.default)({
    secret: sessionSecret,
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false }
}));
app.use(body_parser_1.default.json());
app.use(passport_1.default.initialize());
app.use(passport_1.default.session());
// importing routes
const userAuthRoute_1 = __importDefault(require("./routes/userAuthRoute"));
const passportRoute_1 = __importDefault(require("./routes/passportRoute"));
const protectedRoutes_1 = __importDefault(require("./routes/protectedRoutes"));
// import fbPassportRoute from './routes/fbPassportRoute'
//  import twitterPassportRoute from './routes/twitterPassportRoute'
// using middleware routes
app.use('/v1', userAuthRoute_1.default);
app.use('/auth', passportRoute_1.default);
app.use('/v2', protectedRoutes_1.default);
// app.use('/fbsocial',fbPassportRoute)
// cors middleware 
app.use((0, corsConfig_1.configureCors)());
// sample get route
app.get('/', (req, res) => {
    res.status(200).send('Hello, Gamers!');
});
// server listening
app.listen(port, () => {
    console.log(`Server is running on port ${port}...👍️`);
});
