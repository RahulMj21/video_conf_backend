// importing modules
import { Request, Response, NextFunction } from "express";

const errorHandler = (
  error: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let statusCode = 500;
  let message = "Internal server error";

  if (error?.statusCode) {
    statusCode = error.statusCode;
    message = error.message;
  }

  return res.status(statusCode).json({ success: false, message });
};

export default errorHandler;
