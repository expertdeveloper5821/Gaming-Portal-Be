import express,{ Express } from 'express';
import './config/db'
import bodyParser from 'body-parser';
import Session from 'express-session';
import passport from 'passport';
import { configureCors } from './config/corsConfig';
import Razorpay from "razorpay";
import { environmentConfig } from './config/environmentConfig';


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
import passportRoute from './routes/passportRoute';
import protectedRoutes from './routes/protectedRoutes';
import roomRoutes from './routes/serverRoomIDRoute';
import teamRoutes from './routes/teamRoutes'
import paymentRoute from './routes/paymentRoutes';


// cors middleware 
app.use(configureCors());

// accept body middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false })); 

// using middleware routes
app.use('/v1',userAuthRoute,teamRoutes)
app.use('/auth',passportRoute)
app.use('/v2',protectedRoutes)
app.use('/v3',roomRoutes)
app.use("/api", paymentRoute);



app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: environmentConfig.RAZORPAY_API_KEY })
);

// razorpay instance
export const instance = new Razorpay({
  key_id: environmentConfig.RAZORPAY_API_KEY,
  key_secret: environmentConfig.RAZORPAY_APT_SECRET,
});



export default app;
