// dotenv config
import dotenv from "dotenv";
dotenv.config();

// importing all the required modules
import http from "http";
import config from "config";

// importing all the files
import app from "./app";
import socket from "./utils/socket";
import dbConnect from "./utils/dbConnect";
import logger from "./utils/logger";

const server = http.createServer(app);
const port = config.get<string>("port");

// socket initialization
socket(server);

// db connection
dbConnect();

// listing server
server.listen(port, () => logger.info(`server is running on port--> ${port}`));
