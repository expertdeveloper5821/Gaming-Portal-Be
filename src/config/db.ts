import mongoose from "mongoose";
import { environmentConfig } from "./environmentConfig";
import { printSuccess, printError } from '../utils/consoleMessage'; 

const dbUrl:string = environmentConfig.DB_URL || '';
mongoose
  .connect(dbUrl)
  .then(() => {
    printSuccess("Database Connected...👍️");
  })
  .catch(() => {
    printError("Database not connected...😤");
  });
