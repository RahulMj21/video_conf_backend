// import modules
import { Request, Response, NextFunction } from "express";
import { get } from "lodash";
import config from "config";

// import files
import BigPromise from "../utils/BigPromise";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import JWT from "../utils/JWT";

const deserializeUser = BigPromise(
  async (req: Request, res: Response, next: NextFunction) => {
    // getting token from the request
    const accessToken =
      get(req, "cookies.accessToken") ||
      (get(req, "headers.authorization") &&
        get(req, "headers.authorization").replace(/^Bearer\s/, "")) ||
      null;
    const refreshToken =
      get(req, "cookies.refreshToken") || get(req, "headers.x-refresh") || null;

    // if tokens are not available then return with error
    if (!accessToken || !refreshToken)
      return next(CustomErrorHandler.unauthorized());

    // verify the accessToken
    const { decoded, expired } = JWT.verifyJwt(
      accessToken,
      config.get<string>("access_token_public_key")
    );
    // if accessToken valid then proceed the request
    if (decoded && !expired) {
      res.locals.user = decoded;
      next();
    } else {
      const newAccessToken = await JWT.reIssueAccessToken(
        refreshToken,
        config.get<string>("refresh_token_public_key")
      );
      if (!newAccessToken) return next(CustomErrorHandler.unauthorized());

      // decode the newAccessToken
      const { decoded, expired } = JWT.verifyJwt(
        newAccessToken,
        config.get<string>("access_token_public_key")
      );
      if (!decoded || expired) return next(CustomErrorHandler.unauthorized());

      res.cookie("accessToken", newAccessToken, {
        secure: false,
        maxAge: config.get<number>("access_token_cookie_expiry"),
        httpOnly: true,
        path: "/",
      });

      res.setHeader("x-access-token", newAccessToken);

      res.locals.user = decoded;
      next();
    }
  }
);

export default deserializeUser;
