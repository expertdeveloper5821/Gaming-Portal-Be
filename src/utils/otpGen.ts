import { randomInt } from "crypto";
// Function to generate a random 6-digit OTP consisting of digits only
 export function generateOTP(): string {
    const otpLength = 6;
    let otp = '';
  
    for (let i = 0; i < otpLength; i++) {
      otp += randomInt(10).toString();
    }
  
    return otp;
  }