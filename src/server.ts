import express,{Express, Request, Response} from 'express';
import './config/db'
import { environmentConfig } from './config/environmentConfig';
import { configureCors } from './config/corsConfig';

const app:Express = express();
const port: number = environmentConfig.SERVER_PORT;


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
