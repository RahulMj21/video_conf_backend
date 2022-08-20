// import modules
import express from "express";

// import local files
import Room from "../controllers/room.controller";
import deserializeUser from "../middlewares/deserializeUser";

const router = express.Router();

// get routes
router.route("/rooms").get(deserializeUser, Room.getAllRooms);
// find any room and delete any room
router
  .route("/room/:id")
  .get(deserializeUser, Room.getSingleRoom)
  .delete(deserializeUser, Room.deleteRoom);

// post routes
router.route("/createroom").post(deserializeUser, Room.createRoom);

export default router;
