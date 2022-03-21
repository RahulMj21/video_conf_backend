// importing modules
import jwt from "jsonwebtoken";
import { get, omit } from "lodash";
import Session from "../services/session.service";
import config from "config";

// importing local files
import User from "../services/user.service";

class JWT {
  signJwt(payload: object, secret: string, options = {}) {
    return jwt.sign(payload, Buffer.from(secret, "base64").toString("ascii"), {
      ...(options && options),
      algorithm: "RS256",
    });
  }
  verifyJwt(token: string, secret: string) {
    const decoded = jwt.verify(
      token,
      Buffer.from(secret, "base64").toString("ascii")
    );
    if (decoded) {
      return {
        decoded,
        expired: false,
      };
    } else {
      return {
        decoded: null,
        expired: true,
      };
    }
  }
  async reIssueAccessToken(refreshToken: string, secret: string) {
    // verify refreshToken
    const { decoded, expired } = this.verifyJwt(refreshToken, secret);
    if (!decoded || expired) return false;

    // check if the user exists in the db
    const user = await User.findUser({ _id: get(decoded, "_id") });
    if (!user) return false;

    // check if the session exists
    const session = await Session.findSession({
      _id: get(decoded, "session"),
      user: user._id,
    });
    if (!session) return false;

    // create token
    const accessToken = this.signJwt(
      {
        ...omit(user.toJSON(), [
          "password",
          "_v",
          "forgotPasswordToken",
          "forgotPasswordHash",
          "forgotPasswordExpiry",
        ]),
      },
      config.get<string>("access_token_secret_key"),
      {
        expiresIn: config.get<number>("access_token_expiry"),
      }
    );
    return accessToken;
  }
}

export default new JWT();
