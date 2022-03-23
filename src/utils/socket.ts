// importing modules 👇👇👇👇👇👇
import http from "http";
import { Server } from "socket.io";
import config from "config";
import logger from "./logger";

export interface User {
  _id: string;
  name: string;
  email: string;
}

// socket executable function 👇👇👇👇👇👇
const socket = (server: http.Server) => {
  const socketUserMaping: any = {};
  const io = new Server(server, {
    cors: {
      origin: config.get<string>("frontend_url"),
      methods: ["POST", "GET"],
    },
  });

  io.on("connection", (socket) => {
    logger.info("Socket connected");

    // handling join event 👇👇👇👇👇👇
    socket.on("join", ({ roomId, user }: { roomId: string; user: User }) => {
      socketUserMaping[socket.id] = user;
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      clients.map((client) => {
        io.to(client).emit("add_peer", {
          socketId: socket.id,
          createOffer: false,
          user,
        });
        socket.emit("add_peer", {
          socketId: client,
          createOffer: true,
          user: socketUserMaping[client],
        });
      });
    });

    // handling new icecandidate event 👇👇👇👇👇👇
    socket.on(
      "relay_ice",
      ({ socketId, icecandidate }: { socketId: string; icecandidate: any }) => {
        io.to(socketId).emit("icecandidate", {
          socketId: socket.id,
          icecandidate,
        });
      }
    );

    // handling session description 👇👇👇👇👇👇
    socket.on(
      "relay_sdp",
      ({
        socketId,
        sessionDescription,
      }: {
        socketId: string;
        sessionDescription: object;
      }) => {
        io.to(socketId).emit("session_description", {
          socketId: socket.id,
          sessionDescription,
        });
      }
    );
    // handling mute/unmute 👇👇👇👇👇👇
    const handleMuteUnmute = ({
      event,
      roomId,
      userId,
    }: {
      event: string;
      roomId: string;
      userId: string;
    }) => {
      const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
      clients.forEach((client) => {
        io.to(client).emit(event, {
          userId,
        });
      });
    };

    socket.on(
      "mute",
      ({ roomId, userId }: { roomId: string; userId: string }) => {
        handleMuteUnmute({ event: "mute", roomId, userId });
      }
    );
    socket.on(
      "unmute",
      ({ roomId, userId }: { roomId: string; userId: string }) => {
        handleMuteUnmute({ event: "unmute", roomId, userId });
      }
    );

    // handling leave room 👇👇👇👇👇👇
    const leaveRoom = () => {
      const { rooms } = socket;

      rooms.forEach((room) => {
        const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
        clients.forEach((client) => {
          io.to(client).emit("remove_peer", {
            socketId: socket.id,
            userId: socketUserMaping[socket.id]?._id,
          });
          socket.emit("remove_peer", {
            socketId: client,
            userId: socketUserMaping[client]?._id,
          });
        });
      });
    };

    // listning for leaveroom 👇👇👇👇👇👇
    socket.on("leave", leaveRoom);

    // listen for socket disconnect 👇👇👇👇👇👇
    socket.on("disconnecting", leaveRoom);
  });
};

export default socket;
