// dotenv config
import dotenv from "dotenv";
dotenv.config();

// importing all the required modules
import express from "express";
import cors from "cors";
import config from "config";
import fileUpload from "express-fileupload";

//importing files
import { authRoute, roomRoute, testRoute, userRoute } from "./routes";
import errorHandler from "./middlewares/errorHandler";

const app = express();

// using middlewares
const corsConfig = {
  credentials: true,
  origin: config.get<string>("frontend_url"),
};
app.use(cors(corsConfig));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
const fileUploadConfig = {
  useTempFiles: true,
  tempFileDir: "/temp/",
};
app.use(fileUpload(fileUploadConfig));

// cloudinary config

// api routes
app.use("/api/v1", testRoute);
app.use("/api/v1", authRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", roomRoute);

// error handler
app.use(errorHandler);

export default app;
