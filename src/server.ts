import app from './app';
import { environmentConfig } from './config/environmentConfig';
import { printSuccess, printError } from './utils/consoleMessage'; 

const port: number = environmentConfig.SERVER_PORT;

// sample get route
app.get('/', (req, res) => {
  res.status(200).send('Hello, Gamers!');
});

// server listening
app.listen(port, () => {
  printSuccess(`Server is running on port ${port}...👍️`);

  // Simulating an error
  const error = false;
  if (error) {
    printError(`Server could not start on port ${port}...😵`);
  }
});