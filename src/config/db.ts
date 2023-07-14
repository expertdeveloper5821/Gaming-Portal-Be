import mongoose from "mongoose";
import * as dotenv from 'dotenv';
dotenv.config();

const dbUrl = process.env.DbUrl || '';
mongoose
  .connect(dbUrl)
  .then(() => {
    console.log("Database Connected...👍️");
  })
  .catch((error) => {
    console.log("Database not connected...😤", error);
  });
