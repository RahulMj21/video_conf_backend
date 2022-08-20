// importing modules
import { Request, Response, NextFunction } from "express";
import { get, omit } from "lodash";
import config from "config";

// importing files
import BigPromise from "../utils/BigPromise";
import { RegisterInput } from "../schemas/register.schema";
import User from "../services/user.service";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import Session from "../services/session.service";
import setCookies from "../utils/setCookies";
import { LoginInput } from "../schemas/login.schema";
import Google from "../services/googleAuth.service";

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
        message: `Welcome ${user.name}`,
      });
    }
  );

  login = BigPromise(
    async (
      req: Request<{}, {}, LoginInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      const { email, password } = get(req, "body");
      if (!email || !password)
        return next(new CustomErrorHandler(422, "all fields are required"));

      // check if the user already exists
      const user = await User.findUserAndComparePass(req.body);
      if (!user)
        return next(CustomErrorHandler.badRequest("wrong email or password"));

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
        message: `welcome ${user.name}`,
      });
    }
  );

  googleAuth = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      // getting the code from req.query
      const code = get(req, "query.code");
      // fetching user tokens from google
      const { access_token, id_token } = await Google.getGoogleUserTokens(code);

      // fetching user details from google
      const userDetails = await Google.getGoogleUserDetails(
        access_token,
        id_token
      );

      // check if user's email verified or not
      if (!userDetails.verified_email)
        return next(CustomErrorHandler.unauthorized("email is not verified"));

      // create or update user
      const user = await User.upsertUser(
        { email: userDetails.email },
        {
          name: userDetails.name,
          email: userDetails.email,
          avatar: {
            public_id: "",
            secure_url: userDetails.picture,
          },
          isLoggedInWithGoogle: true,
        }
      );
      if (!user) return next(CustomErrorHandler.wentWrong());
      // create session
      const session = await Session.upsertSession(
        { user: get(user, "_id"), userAgent: req.get("user-agent") || "" },
        { user: get(user, "_id"), userAgent: req.get("user-agent") || "" }
      );
      if (!session) return next(CustomErrorHandler.wentWrong());

      // creating token and set cookies
      await setCookies(user, session._id, res);

      // redirecting to home page
      return res.redirect(`${config.get<string>("frontend_url")}`);
    }
  );

  logout = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      // get the user from cookie
      const DecodedUser = get(res, "locals.user");

      // check if the user exist in db
      const user = await User.findUser({ _id: get(DecodedUser, "_id") });
      if (!user) return next(CustomErrorHandler.unauthorized());

      // find the session and delete
      const session = await Session.deleteSession({
        user: get(user, "_id"),
        userAgent: req.get("user-agent") || "",
      });
      if (!session) return next(CustomErrorHandler.unauthorized());

      // clear cookies
      res.clearCookie("accessToken");
      res.clearCookie("refreshToken");

      // sending response
      return res.status(200).json({
        success: true,
        message: "logged out successfully",
      });
    }
  );
}

export default new AuthController();
