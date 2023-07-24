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
const sessionSecret = process.env.sessionSecret || "defaultSecret";
app.use(Session({
  secret :sessionSecret,
  resave :  false,
  saveUninitialized : true,
  cookie : {secure:false}
}))
app.use(passport.initialize());
app.use(passport.session());
// importing routes
import userAuthRoute from './routes/userAuthRoute';
import passportRoute from './routes/passportRoute'
import fbPassportRoute from './routes/fbPassportRoute'
//  import twitterPassportRoute from './routes/twitterPassportRoute'

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
app.use('/fbsocial',fbPassportRoute)
// app.use('/twittersocial',twitterPassportRoute)

  // sample get route
app.get('/', (req, res) => {
  res.send('Hello, Gamers!');
});

// server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}...👍️`);
});
