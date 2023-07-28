"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const app_1 = __importDefault(require("./app"));
const environmentConfig_1 = require("./config/environmentConfig");
const consoleMessage_1 = require("./utils/consoleMessage");
const port = environmentConfig_1.environmentConfig.SERVER_PORT;
// sample get route
app_1.default.get('/', (req, res) => {
    res.status(200).send('Hello, Gamers!');
});
// server listening
app_1.default.listen(port, () => {
    (0, consoleMessage_1.printSuccess)(`Server is running on port ${port}...👍️`);
    // Simulating an error
    const error = false;
    if (error) {
        (0, consoleMessage_1.printError)(`Server could not start on port ${port}...😵`);
    }
});
