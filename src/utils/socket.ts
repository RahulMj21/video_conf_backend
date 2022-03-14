// importing modules
import http from "http";
import { Server } from "socket.io";
import config from "config";

// socket executable function
const socket = (server: http.Server) => {
  const io = new Server(server, {
    cors: {
      credentials: true,
      origin: config.get<string>("frontend_url"),
    },
  });

  io.on("connection", (socket) => {
    console.log("Socket connected");
  });
};

export default socket;
