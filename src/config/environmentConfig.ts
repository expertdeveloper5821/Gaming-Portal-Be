import * as dotenv from 'dotenv';
dotenv.config();

// setting the all env credentails
export interface EnvironmentConfig {
  JWT_SECRET: string;
  SERVER_PORT: number;
  DB_URL: string;
  EMAIL_HOST: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_PORT: number;
  EMAIL_FROM: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  CLIENT_URL: string;
  SESSION_SECRET :string;
  RESET_PASSWORD : string;
  RAZORPAY_API_KEY: string;
  RAZORPAY_APT_SECRET: string;
  Payment_SUCCESS_URL: string;
  CLOUD_NAME: string;
  API_KEY: string,
  API_SECRET: string
}

export const environmentConfig: EnvironmentConfig = {
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
  SESSION_SECRET : process.env.sessionSecret || 'sessionsecret',
  RESET_PASSWORD : process.env.reset_password || 'http://192.168.1.43:3000/reset-password',
  RAZORPAY_API_KEY: process.env.razorPayKey || 'razorKey',
  RAZORPAY_APT_SECRET: process.env.razorPaySecret || 'razorSecret',
  Payment_SUCCESS_URL: process.env.paymentSuccessUrl || 'http://localhost:3000/paymentsuccess',
  CLOUD_NAME: process.env.cloudName || 'cloudnery',
  API_KEY: process.env.apiKey || 'cloudnery',
  API_SECRET: process.env.apiSecret || 'cloudnery',
};
