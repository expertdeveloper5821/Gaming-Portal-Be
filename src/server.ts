import express from 'express';
import './config/db'
import cors from 'cors';
import bodyParser from "body-parser";
import * as dotenv from 'dotenv'
dotenv.config()

const app = express();
const port = process.env.serverPort;

// all routes import here 
import roomRoute from './routes/serverRoomIDRoute';

// cors middleware 
app.use(
    cors({
      origin: "*",
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
  );

// accept body middleware
  app.use(express.json());
  app.use(bodyParser.urlencoded({ extended: true }));
  app.use(express.urlencoded({ extended: false }));  

// all routes use as a middleware
app.use('/v2', roomRoute)

// sample get route
app.get('/', (req, res) => {
  res.send('Hello, Gamers!');
});

// server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}...👍️`);
});
