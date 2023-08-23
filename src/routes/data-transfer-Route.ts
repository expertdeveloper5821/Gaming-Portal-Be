import express from "express";
const route = express.Router();
import {transferData} from "../middlewares/data-transfer";


// post api 
route.post('/copy', transferData)



export default route;
