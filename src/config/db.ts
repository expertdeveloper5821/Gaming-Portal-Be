import mongoose from "mongoose";
import { environmentConfig } from "./environmentConfig";
import { printSuccess, printError } from "../utils/consoleMessage";

const dbUrl: string = environmentConfig.DB_URL;
mongoose
  .connect(dbUrl, { dbName: environmentConfig.DB_NAME })
  .then((c) => {
    printSuccess(`Database Connected...👍️, ${c.connection.host}`);
  })
  .catch(() => {
    printError("Database not connected...😤");
  });
