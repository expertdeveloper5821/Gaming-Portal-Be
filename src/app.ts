import express,{ Express } from 'express';
import './config/db'
import bodyParser from 'body-parser';
import Session from 'express-session';
import passport from 'passport';
import { configureCors } from './config/corsConfig';
import Razorpay from "razorpay";
import { environmentConfig } from './config/environmentConfig';
import path from 'path';
import MongoDBStore from 'connect-mongodb-session';

import { sendMailToUser } from './middlewares/news-letter';
sendMailToUser();

const app:Express = express();

// MongoDBStore instance
const MongoDBStoreSession = MongoDBStore(Session);

// Configure MongoDBStore
const store = new MongoDBStoreSession({
  uri: environmentConfig.DB_URL, 
  collection: 'sessions', // Collection name for storing sessions
});


// Initialize Passport middleware
const sessionSecret = process.env.sessionSecret || "defaultSecret";
app.use(Session({
  secret :sessionSecret,
  resave :  false,
  saveUninitialized : true,
  cookie : {secure:false},
  store: store,
}))


app.use(passport.initialize());
app.use(passport.session());

// importing routes
import userAuthRoute from './routes/userAuthRoute';
import passportRoute from './routes/passportRoute';
import protectedRoutes from './routes/protectedRoutes';
import roomRoutes from './routes/serverRoomIDRoute';
import teamRoutes from './routes/teamRoutes';
import paymentRoute from './routes/paymentRoutes';
import qrCodeRoute from './routes/qrCodeRoute';
import winnerRoute from './routes/winnerPlayerRoute';
import reportRoute from './routes/reportRoute';
import dataRoute from './routes/data-transfer-Route';


// cors middleware 
app.use(configureCors());

// accept body middleware
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.urlencoded({ extended: false })); 
app.use(express.static(path.join(__dirname, 'public')));

// using middleware routes
app.use('/api/v1/user',userAuthRoute)
app.use('/auth',passportRoute)
app.use('/api/v1/role',protectedRoutes)
app.use('/api/v1/room',roomRoutes)
app.use('/api/v1/team',teamRoutes)
app.use("/api/v1/razorpay", paymentRoute)
app.use('/api/v1/payment', qrCodeRoute)
app.use('/api/v1/winners', winnerRoute)
app.use('/api/v1/report', reportRoute)
app.use('/api/v1/data', dataRoute)


app.get("/api/getkey", (req, res) =>
  res.status(200).json({ key: environmentConfig.RAZORPAY_API_KEY })
);

// razorpay instance
export const instance = new Razorpay({
  key_id: environmentConfig.RAZORPAY_API_KEY,
  key_secret: environmentConfig.RAZORPAY_APT_SECRET,
});






export default app;
