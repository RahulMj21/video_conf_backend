// importing modules
import { Request, Response, NextFunction } from "express";
import { get, omit } from "lodash";

// importing files
import BigPromise from "../utils/BigPromise";
import { RegisterInput } from "../schemas/register.schema";
import User from "../services/user.service";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import Session from "../services/session.service";
import setCookies from "../utils/setCookies";
import { LoginInput } from "../schemas/login.schema";

class AuthController {
  register = BigPromise(
    async (
      req: Request<{}, {}, RegisterInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      // check if the user already exists
      const existingUser = await User.findUser({
        email: get(req, "body.email"),
      });
      if (existingUser)
        return next(CustomErrorHandler.conflict("email already taken"));

      // create user
      const user = await User.createUser(req.body);
      if (!user) return next(CustomErrorHandler.wentWrong());

      // create session
      const session = await Session.upsertSession(
        {
          user: user._id,
          userAgent: req.get("user-agent") || "",
        },
        {
          user: user._id,
          userAgent: req.get("user-agent") || "",
        }
      );
      if (!session) return next(CustomErrorHandler.wentWrong());

      // create token and set cookies
      await setCookies(user, session._id, res);

      // send response
      return res.status(200).json({
        success: true,
        message: "user registered successfully",
        user,
      });
    }
  );

  login = BigPromise(
    async (
      req: Request<{}, {}, LoginInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      // check if the user already exists
      const user = await User.findUserAndComparePass(req.body);
      if (!user)
        return next(CustomErrorHandler.conflict("email already taken"));

      // create session
      const session = await Session.upsertSession(
        {
          user: omit(user, []),
          userAgent: req.get("user-agent") || "",
        },
        {
          user: user._id,
          userAgent: req.get("user-agent") || "",
        }
      );
      if (!session) return next(CustomErrorHandler.wentWrong());

      // create token and set cookies
      await setCookies(user, session._id, res);

      // send response
      return res.status(200).json({
        success: true,
        message: "user logged in successfully",
        user,
      });
    }
  );

  googleAuth = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );

  logout = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {}
  );
}

export default new AuthController();
