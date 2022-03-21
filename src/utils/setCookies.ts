// importing Modules
import { Response } from "express";
import config from "config";
import mongoose from "mongoose";

// importing files
import JWT from "./JWT";

const setCookies = async (
  user: object,
  session: mongoose.Types.ObjectId,
  res: Response
) => {
  const tokenData = {
    ...user,
    session,
  };
  const accessToken = JWT.signJwt(
    tokenData,
    config.get<string>("access_token_private_key"),
    {
      expiresIn: config.get<number>("access_token_expiry"),
    }
  );
  const refreshToken = JWT.signJwt(
    tokenData,
    config.get<string>("refresh_token_private_key"),
    {
      expiresIn: config.get<number>("refresh_token_expiry"),
    }
  );
  const cookieOptions = {
    secure: false,
    maxAge: config.get<number>("access_token_cookie_expiry"),
    httpOnly: true,
    path: "/",
  };
  res.cookie("accessToken", accessToken, {
    ...cookieOptions,
    maxAge: config.get<number>("access_token_cookie_expiry"),
  });
  res.cookie("refreshToken", refreshToken, {
    ...cookieOptions,
    maxAge: config.get<number>("refresh_token_cookie_expiry"),
  });
};

export default setCookies;
