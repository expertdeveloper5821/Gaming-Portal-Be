import express,{Express, Request, Response} from 'express';
import './config/db'
import { environmentConfig } from './config/environmentConfig';
import { configureCors } from './config/corsConfig';
import passport from 'passport';
import Session from 'express-session';
import bodyParser from 'body-parser';
const { authenticateJWT, authorizeRole } = require('./middlewares/authMiddleware');
const app:Express = express();
const port: number = environmentConfig.SERVER_PORT;

// Initialize Passport middleware
const sessionSecret = environmentConfig.SESSION_SECRET
app.use(Session({
  secret :sessionSecret,
  resave :  false,
  saveUninitialized : true,
  cookie : {secure:false}
}))
app.use(bodyParser.json());
app.use(passport.initialize());
app.use(passport.session());
// importing routes
import userAuthRoute from './routes/userAuthRoute';
import passportRoute from './routes/passportRoute'
import protectedRoutes from './routes/protectedRoutes'
// import fbPassportRoute from './routes/fbPassportRoute'
//  import twitterPassportRoute from './routes/twitterPassportRoute'

// using middleware routes
app.use('/v1',userAuthRoute)
app.use('/auth',passportRoute)
app.use('/v2',protectedRoutes)
// app.use('/fbsocial',fbPassportRoute)

// cors middleware 
app.use(configureCors());
// sample get route
app.get('/', (req:Request, res:Response) => {
  res.status(200).send('Hello, Gamers!');
});
// server listening
app.listen(port, () => {
  console.log(`Server is running on port ${port}...👍️`);
});
