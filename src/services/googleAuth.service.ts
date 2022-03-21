// importing modules
import config from "config";
import qs from "qs";
import axios from "axios";
import logger from "../utils/logger";

// importing files

export interface GoogleUserTokens {
  access_token: string;
  refrest_token: string;
  id_token: string;
  scope: string;
  expires_in: number;
}

export interface GoogleUserDetails {
  id: string;
  name: string;
  email: string;
  verified_email: Boolean;
  given_name: string;
  family_name: string;
  picture: string;
  locale: string;
}

class GoogleAuth {
  getGoogleUserTokens = async (code: string): Promise<GoogleUserTokens> => {
    try {
      const token_uri = config.get<string>("google_token_uri");
      const options = {
        code,
        client_id: config.get<string>("google_client_id"),
        client_secret: config.get<string>("google_client_secret"),
        redirect_uri: config.get<string>("redirect_uri"),
      };
      const query = qs.stringify(options);

      const res = await axios.post<GoogleUserTokens>(token_uri, query, {
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
      });
      return res.data;
    } catch (error: any) {
      logger.error("google data fetching error");
      throw new Error("google data fetching error---> " + error.message);
    }
  };
  getGoogleUserDetails = async (
    access_token: string,
    id_token: string
  ): Promise<GoogleUserDetails> => {
    try {
      const url = `https://www.googleapis.com/oauth2/v1/userinfo?alt=json&access_token=${access_token}`;

      const res = await axios.get<GoogleUserDetails>(url, {
        headers: {
          Authorization: `Bearer ${id_token}`,
        },
      });
      return res.data;
    } catch (error: any) {
      logger.error("google data fetching error");
      throw new Error("google data fetching error---> " + error.message);
    }
  };
}

export default new GoogleAuth();
