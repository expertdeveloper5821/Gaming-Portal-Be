import express from 'express';
import './config/db'
import * as dotenv from 'dotenv'
import cors from 'cors';
import bodyParser from 'body-parser';
import Session from 'express-session';

dotenv.config()

const app = express();
const port = process.env.serverPort;
import passport from 'passport';

// Initialize Passport middleware

app.use(Session({
  secret : "GOOOGELEDSKDJS",
  resave :  false,
  saveUninitialized : true,
  cookie : {secure:false}
}))
app.use(passport.initialize());
app.use(passport.session());
// importing routes
import userAuthRoute from './routes/userAuthRoute';
import passportRoute from './routes/passportRoute'

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
app.use('/auth',passportRoute)

  // sample get route
app.get('/', (req, res) => {
  res.send('Hello, Gamers!');
});

// server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}...👍️`);
});
