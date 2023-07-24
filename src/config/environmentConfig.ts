import * as dotenv from 'dotenv';
dotenv.config();

export interface EnvironmentConfig {
  JWT_SECRET: string;
  SERVER_PORT: number;
  DB_URL: string;
  DB_HOST: string;
  EMAIL_USER: string;
  EMAIL_PASSWORD: string;
  EMAIL_PORT: number;
  EMAIL_FROM: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  CLIENT_URL: string;
}

export const environmentConfig: EnvironmentConfig = {
  JWT_SECRET: process.env.jwtSecret || 'defaultSecret',
  SERVER_PORT: process.env.serverPort ? parseInt(process.env.serverPort, 10) : 3000,
  DB_URL: process.env.DbUrl || 'mongodb://localhost:27017/mydatabase',
  DB_HOST: process.env.emailHost || 'localhost',
  EMAIL_USER: process.env.emailUser || 'email@example.com',
  EMAIL_PASSWORD: process.env.emailPassword || 'emailPassword',
  EMAIL_PORT: process.env.emailPort ? parseInt(process.env.emailPort, 10) : 587,
  EMAIL_FROM: process.env.emailFrom || 'noreply@example.com',
  CLIENT_ID: process.env.clientID || 'yourClientId',
  CLIENT_SECRET: process.env.clientSecret || 'yourClientSecret',
  CLIENT_URL: process.env.clientUrl || 'http://localhost:3000',
};
