import express,{ Express } from 'express';
import './config/db'
import bodyParser from 'body-parser';
import Session from 'express-session';
import passport from 'passport';
import { configureCors } from './config/corsConfig';


const app:Express = express();

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


// cors middleware 
app.use(configureCors());

// accept body middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false })); 

// using middleware routes
app.use('/v1',userAuthRoute)
app.use('/auth',passportRoute)


export default app;
