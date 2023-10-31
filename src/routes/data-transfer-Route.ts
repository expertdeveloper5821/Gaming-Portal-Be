import express from "express";
const route = express.Router();
import {transferData} from "../middlewares/data-transfer";
import { sendMailWithSchedule } from "../middlewares/news-letter";


// post api 
route.post('/copy', transferData)

// cron job sending mail route
route.post('/corn-job', sendMailWithSchedule);




export default route;
