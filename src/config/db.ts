import mongoose from "mongoose";
import * as dotenv from 'dotenv'

dotenv.config();

const url = process.env.DB_URL || ''

mongoose.connect(
    url )
   .then(() => {
     console.log("Database Connected 👍️");
   })
   .catch((error) => {
     console.log("Database not connected", error);
   });
 