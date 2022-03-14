// importing modules
import { Request, Response, NextFunction } from "express";

// importing files
import BigPromise from "../utils/BigPromise";

class UserController {
  getAllUsers = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  getSingleUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  getCurrentUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  updateProfile = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  updatePassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  forgotPassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
  resetPassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}

export default new UserController();
