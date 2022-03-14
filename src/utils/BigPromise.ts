// importing modules
import { Request, Response, NextFunction } from "express";

// higher level function
const BigPromise =
  (theFunc: Function) => (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(theFunc(req, res, next)).catch(next);
  };

export default BigPromise;
