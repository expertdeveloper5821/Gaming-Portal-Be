"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateOTP = void 0;
const crypto_1 = require("crypto");
// Function to generate a random 6-digit OTP consisting of digits only
function generateOTP() {
    const otpLength = 6;
    let otp = '';
    for (let i = 0; i < otpLength; i++) {
        otp += (0, crypto_1.randomInt)(10).toString();
    }
    return otp;
}
exports.generateOTP = generateOTP;
