"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.configureCors = void 0;
const cors_1 = __importDefault(require("cors"));
// Function to configure and apply CORS middleware
const configureCors = ({ origin = '*', methods = 'GET,POST,PUT,DELETE', credentials = true } = {}) => {
    const corsOptions = {
        origin,
        methods,
        credentials,
    };
    // Create and return the actual CORS middleware
    return (0, cors_1.default)(corsOptions);
};
exports.configureCors = configureCors;
