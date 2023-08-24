import express from "express";
const route = express.Router();
import { searchAllUser, searchAllRooms} from "../controllers/searchFilterController";


// get api 
route.get('/search-users', searchAllUser)

// get api 
route.get('/search-rooms', searchAllRooms)


export default route;
