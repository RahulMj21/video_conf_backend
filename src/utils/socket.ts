// importing modules 👇👇👇👇👇👇
import http from "http";
import { Server } from "socket.io";
import config from "config";
import logger from "./logger";
import Room from "../services/room.service";
import User from "../services/user.service";

export interface User {
  _id: string;
  name: string;
  avatar: {
    public_id: string;
    secure_url: string;
  };
}
interface SocketUserMapping {
  [key: string]: User;
}

// socket executable function 👇👇👇👇👇👇
const socket = (server: http.Server) => {
  const socketUserMapping: SocketUserMapping = {};
  const io = new Server(server, {
    cors: {
      origin: config.get<string>("frontend_url"),
      methods: ["POST", "GET"],
    },
  });

  io.on("connection", (socket) => {
    logger.info("Socket connected");

    // handling join event 👇👇👇👇👇👇
    socket.on(
      "join",
      async ({ roomId, user }: { roomId: string; user: User }) => {
        const room = await Room.findSingleRoom({ _id: roomId });
        if (!room) return;
        const existingClient = room.clientList.find(
          (item) => item?._id?.toString() === user?._id?.toString()
        );
        if (!existingClient || typeof existingClient === "undefined") {
          room.clientList = [
            ...room.clientList,
            { socketId: socket.id, ...user },
          ];
          await room.save({ validateBeforeSave: false });
        }

        const clients = Array.from(io.sockets.adapter.rooms.get(roomId) || []);
        clients.forEach(async (client: string) => {
          io.to(client).emit("add_peer", {
            socketId: socket.id,
            user,
            createOffer: false,
          });
          const socketUser = room.clientList.find(
            (item) => item.socketId === client
          );
          socket.emit("add_peer", {
            socketId: client,
            user: socketUser,
            createOffer: true,
          });
        });
        socket.join(roomId);
      }
    );

    // handling new icecandidate event 👇👇👇👇👇👇
    socket.on("relay_ice", ({ socketId, icecandidate }) => {
      io.to(socketId).emit("icecandidate", {
        socketId: socket.id,
        icecandidate,
      });
    });

    // handling session description 👇👇👇👇👇👇
    socket.on("relay_sdp", ({ socketId, sessiondescription }) => {
      io.to(socketId).emit("sessiondescription", {
        socketId: socket.id,
        sessiondescription,
      });
    });

    // handling mute/unmute 👇👇👇👇👇👇

    // handling leave room 👇👇👇👇👇👇
    const leaveRoom = () => {
      const rooms = socket.rooms;
      rooms.forEach((room) => {
        console.log(room);
        const clients = Array.from(io.sockets.adapter.rooms.get(room) || []);
        clients.forEach((client) => {
          io.to(client).emit("remove_peer", {
            socketId: socket.id,
          });
          socket.emit("remove_peer", {
            socketId: client,
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
