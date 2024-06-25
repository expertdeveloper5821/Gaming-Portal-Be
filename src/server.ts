import app from "./app";
import http from "http";
import { environmentConfig } from "./config/environmentConfig";
import { printSuccess, printError } from "./utils/consoleMessage";
import { setupSocketIO } from "./middlewares/socket";

const port: number =
  (process.env.PORT as unknown as number) || environmentConfig.SERVER_PORT;

console.log(port, "port");
console.log(
  process.env.NODE_ENV,
  "node environment",
  process.env.VERCEL_ENV,
  "vercel environment"
);
console.log(environmentConfig.DB_NAME, environmentConfig.DB_URL);
console.log(environmentConfig.ENV, environmentConfig.SERVER_PORT);

const server = http.createServer(app);

// Set up Socket.io
export const io = setupSocketIO(server);
app.locals.io = io;

// sample get route
app.get("/", (req, res) => {
  res.status(200).send("Hello, Gamers!");
});

// server listening
server.listen(port, () => {
  printSuccess(`Server is running on port ${port}...👍️`);

  // Simulating an error
  const error = false;
  if (error) {
    printError(`Server could not start on port ${port}...😵`);
  }
});
