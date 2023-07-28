"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = __importDefault(require("mongoose"));
const environmentConfig_1 = require("./environmentConfig");
const consoleMessage_1 = require("../utils/consoleMessage");
const dbUrl = environmentConfig_1.environmentConfig.DB_URL || '';
mongoose_1.default
    .connect(dbUrl)
    .then(() => {
    (0, consoleMessage_1.printSuccess)("Database Connected...👍️");
})
    .catch(() => {
    (0, consoleMessage_1.printError)("Database not connected...😤");
});
