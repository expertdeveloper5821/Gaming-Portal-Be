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
Object.defineProperty(exports, "__esModule", { value: true });
exports.environmentConfig = void 0;
const dotenv = __importStar(require("dotenv"));
dotenv.config();
exports.environmentConfig = {
    JWT_SECRET: process.env.jwtSecret || 'defaultSecret',
    SERVER_PORT: process.env.serverPort ? parseInt(process.env.serverPort, 10) : 3000,
    DB_URL: process.env.DbUrl || 'mongodb://localhost:27017/mydatabase',
    EMAIL_HOST: process.env.emailHost || 'email@example.com',
    EMAIL_USER: process.env.emailUser || 'email@example.com',
    EMAIL_PASSWORD: process.env.emailPassword || 'emailPassword',
    EMAIL_PORT: process.env.emailPort ? parseInt(process.env.emailPort, 10) : 587,
    EMAIL_FROM: process.env.emailFrom || 'noreply@example.com',
    CLIENT_ID: process.env.clientID || 'yourClientId',
    CLIENT_SECRET: process.env.clientSecret || 'yourClientSecret',
    CLIENT_URL: process.env.clientUrl || 'http://localhost:3000',
    SESSION_SECRET: process.env.sessionSecret || 'sessionsecret',
    RESET_PASSWORD: process.env.reset_password || 'http://192.168.1.43:3000/reset-password'
};
