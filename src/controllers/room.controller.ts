// importing modules
import { Request, Response, NextFunction } from "express";

// importing files
import BigPromise from "../utils/BigPromise";

class RoomController {
  createRoom = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  deleteRoom = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}

export default new RoomController();
