import express from 'express';
import './config/db'
import * as dotenv from 'dotenv'
import cors from 'cors';
dotenv.config()

const app = express();
const port = process.env.serverPort;


// cors middleware 
app.use(
    cors({
      origin: "*",
      methods: "GET,POST,PUT,DELETE",
      credentials: true,
    })
  );

// sample get route
app.get('/', (req, res) => {
  res.send('Hello, Gamers!');
});

// server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}...👍️`);
});
