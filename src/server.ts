import express, { Application, Request, Response } from "express";
import bodyParser from "body-parser";
import './config/db'
const cors = require('cors')

const app: Application = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(bodyParser.json());
app.use(cors());

// Routes
app.get("/", (req: Request, res: Response) => {
  res.send("Hello, world!");
})

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
