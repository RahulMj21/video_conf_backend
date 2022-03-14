// importing modules
import mongoose from "mongoose";
import config from "config";
import logger from "./logger";

// db connection function
const dbConnect = async () => {
  const connectionUri = config.get<string>("db_url");

  mongoose
    .connect(connectionUri)
    .then(() => logger.info("db connected.."))
    .catch((error: any) => {
      logger.info(
        "Unable to connect to the server",
        error?.message && error.message
      );
      process.exit(1);
    });
};

export default dbConnect;
