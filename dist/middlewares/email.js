"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.transporter = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const environmentConfig_1 = require("../config/environmentConfig");
//  nodemailer transporter
exports.transporter = nodemailer_1.default.createTransport({
    host: environmentConfig_1.environmentConfig.EMAIL_HOST,
    port: parseInt(environmentConfig_1.environmentConfig.EMAIL_PORT),
    secure: false,
    auth: {
        user: environmentConfig_1.environmentConfig.EMAIL_USER,
        pass: environmentConfig_1.environmentConfig.EMAIL_PASSWORD,
    },
});
