// import * as dotenv from 'dotenv';
// dotenv.config();
// console.log("environment check", process.env)
// setting the all env credentails
import path from "path";
process.env.NODE_CONFIG_DIR = path.resolve(__dirname, "../", "configurations");
console.log(process.env.NODE_CONFIG_DIR, "hi");

import config from "config";
import dotenv from "dotenv";

export interface EnvironmentConfig {
  ENV: string;
  JWT_SECRET: string;
  SERVER_PORT: number;
  DB_URL: string;
  DB_NAME: string;
  EMAIL_HOST: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_PORT: number;
  EMAIL_FROM: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  CLIENT_URL: string;
  SESSION_SECRET: string;
  RESET_PASSWORD: string;
  LOGIN_PAGE: string;
  REGISTER_PAGE: string;
  RAZORPAY_API_KEY: string;
  RAZORPAY_APT_SECRET: string;
  Payment_SUCCESS_URL: string;
  CLOUD_NAME: string;
  API_KEY: string;
  API_SECRET: string;
  GET_ROOM: string;
}

// export const environmentConfig: EnvironmentConfig = {
//   JWT_SECRET: process.env.jwtSecret || "defaultSecret",
//   SERVER_PORT: process.env.serverPort
//     ? parseInt(process.env.serverPort, 10)
//     : 3000,
//   DB_URL: process.env.DbUrl || "mongodb://localhost:27017/mydatabase",
//   EMAIL_HOST: process.env.emailHost || "email@example.com",
//   EMAIL_USER: process.env.emailUser || "email@example.com",
//   EMAIL_PASSWORD: process.env.emailPassword || "emailPassword",
//   EMAIL_PORT: process.env.emailPort ? parseInt(process.env.emailPort, 10) : 587,
//   EMAIL_FROM: process.env.emailFrom || "noreply@example.com",
//   CLIENT_ID: process.env.clientID || "yourClientId",
//   CLIENT_SECRET: process.env.clientSecret || "yourClientSecret",
//   CLIENT_URL: process.env.clientUrl || "http://localhost:3000",
//   SESSION_SECRET: process.env.sessionSecret || "sessionsecret",
//   RESET_PASSWORD:
//     process.env.reset_password || "http://localhost:3000/reset-password",
//   LOGIN_PAGE: process.env.login_page || "http://localhost:3000/auth/login",
//   REGISTER_PAGE:
//     process.env.register_page || "http://localhost:3000/auth/signup",
//   RAZORPAY_API_KEY: process.env.razorPayKey || "razorKey",
//   RAZORPAY_APT_SECRET: process.env.razorPaySecret || "razorSecret",
//   Payment_SUCCESS_URL:
//     process.env.paymentSuccessUrl || "http://localhost:3000/paymentsuccess",
//   CLOUD_NAME: process.env.cloudName || "cloudnery",
//   API_KEY: process.env.apiKey || "cloudnery",
//   API_SECRET: process.env.apiSecret || "cloudnery",
//   GET_ROOM:
//     process.env.getRoom ||
//     "https://gaming-portal-be-dev.vercel.app/api/v1/room/rooms",
// };

export const environmentConfig: EnvironmentConfig = {
  ENV: config.get("env"),

  JWT_SECRET: config.get("jwt.jwtSecret") || "defaultSecret",

  SERVER_PORT: config.get("port") ? parseInt(config.get("port"), 10) : 3000,

  DB_URL: config.get("DbUrl"),
  DB_NAME: config.get("DbName"),
  EMAIL_HOST: config.get("email.emailHost") || "email@example.com",

  EMAIL_USER: config.get("email.emailUser") || "email@example.com",

  EMAIL_PASSWORD: config.get("email.emailPassword") || "emailPassword",

  EMAIL_PORT: config.get("email.emailPort")
    ? parseInt(config.get("email.emailPort"), 10)
    : 587,

  EMAIL_FROM: config.get("email.emailFrom") || "noreply@example.com",

  CLIENT_ID: config.get("googleApiCredentails.clientID") || "yourClientId",

  CLIENT_SECRET:
    config.get("googleApiCredentails.clientSecret") || "yourClientSecret",

  CLIENT_URL:
    config.get("googleApiCredentails.clientUrl") || "http://localhost:3000",

  SESSION_SECRET: config.get("sessionSecret") || "sessionsecret",

  RESET_PASSWORD:
    config.get("reset_password") || "http://localhost:3000/reset-password",

  LOGIN_PAGE: config.get("login_page") || "http://localhost:3000/auth/login",

  REGISTER_PAGE:
    process.env.register_page || "http://localhost:3000/auth/signup",

  RAZORPAY_API_KEY: config.get("RazorpayCredentials.razorPayKey") || "razorKey",

  RAZORPAY_APT_SECRET:
    config.get("RazorpayCredentials.razorPaySecret") || "razorSecret",

  Payment_SUCCESS_URL:
    config.get("RazorpayCredentials.paymentSuccessUrl") ||
    "http://localhost:3000/paymentsuccess",

  CLOUD_NAME: config.get("cloudinaryCredentials.cloudName") || "cloudnery",

  API_KEY: config.get("cloudinaryCredentials.apiKey") || "cloudnery",

  API_SECRET: config.get("cloudinaryCredentials.apiSecret") || "cloudnery",

  GET_ROOM:
    config.get("getRoom") ||
    "https://gaming-portal-be-dev.vercel.app/api/v1/room/rooms",
};
