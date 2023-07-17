import express from 'express';
import './config/db'
import * as dotenv from 'dotenv'
import cors from 'cors';
import bodyParser from 'body-parser';
dotenv.config()

const app = express();
const port = process.env.serverPort;

// importing routes
import userAuthRoute from './routes/userAuthRoute';

// cors middleware 
app.use(
    cors({
      origin: "*",
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
  );
  app.use(bodyParser.json());
// using middleware routes
app.use('/v1',userAuthRoute)

  // sample get route
app.get('/', (req, res) => {
  res.send('Hello, Gamers!');
});

// server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}...👍️`);
});
