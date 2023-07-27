import nodemailer from "nodemailer";
import * as dotenv from "dotenv";
dotenv.config();


//  nodemailer transporter
 export const transporter = nodemailer.createTransport({
  host: process.env.emailHost as string,
  port: parseInt(process.env.emailPort as string),
  secure: false,
  auth: {
    user: process.env.emailUser as string,
    pass: process.env.emailPassword as string,
  },
});
