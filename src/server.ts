import express, { Application, Request, Response } from "express";
import mongoose from "mongoose";
import bodyParser from "body-parser";
const cors = require('cors')

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Connect to MongoDB
mongoose
  .connect("mongodb://localhost:27017/mydatabase", {
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, world!");
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
