// importing modules
import { Request, Response, NextFunction } from "express";

// importing files
import BigPromise from "../utils/BigPromise";

class AuthController {
  register = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  login = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  googleAuth = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  logout = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}

export default new AuthController();
