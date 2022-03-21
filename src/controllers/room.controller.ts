// importing modules
import { Request, Response, NextFunction } from "express";
import { get } from "lodash";

// importing files
import BigPromise from "../utils/BigPromise";
import Room from "../services/room.service";
import CustomErrorHandler from "../utils/CustomErrorHandler";

class RoomController {
  createRoom = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      // getting the room name from the req.body
      const roomName: string = get(req, "body,roomName");
      if (!roomName)
        return next(CustomErrorHandler.badRequest("please a room name"));

      // getting the user from cookie
      const user = get(res, "locals.user");

      // creating room
      const room = await Room.createRoom({ roomName, roomCreator: user._id });
      if (!room) return next(CustomErrorHandler.wentWrong());

      return res.status(200).json({
        success: true,
        message: "room created successfully",
        room,
      });
    }
  );
  getAllRooms = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      // fetching all the rooms from db
      const rooms = await Room.findAllRooms();
      if (!rooms) return CustomErrorHandler.notFound("didn't found any room");

      // sending response
      return res.status(200).json({
        success: true,
        rooms,
      });
    }
  );
  getSingleRoom = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      // getting the room id from req.params
      const _id = get(req, "params.id");
      if (!_id)
        return next(
          CustomErrorHandler.badRequest(
            "room id is not present in request params"
          )
        );

      // getting the room from db
      const room = await Room.findSingleRoom({ _id });
      if (!room) return CustomErrorHandler.notFound("room not found");

      // sending response
      return res.status(200).json({
        success: true,
        room: room.toJSON(),
      });
    }
  );
  deleteRoom = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      // getting the user from cookie
      const user = get(res, "locals.user");

      // getting the room id from req.params
      const _id = get(req, "params.id");
      if (!_id)
        return next(
          CustomErrorHandler.badRequest(
            "room id is not present in request params"
          )
        );

      // getting the room from db
      const room = await Room.findSingleRoom({ _id });
      if (!room) return CustomErrorHandler.notFound("room not found");

      // check if the roomCreator matches with the current user
      if (room.roomCreator.toString !== user._id)
        return next(
          new CustomErrorHandler(403, "you are not authorized for this action")
        );

      // delete the room
      room.remove();

      // sending response
      return res.status(200).json({
        success: true,
        message: "room deleted successfully",
      });
    }
  );
}

export default new RoomController();
