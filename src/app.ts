// dotenv config
import dotenv from "dotenv";
dotenv.config();

// importing all the required modules
import express from "express";
import cors from "cors";
import config from "config";
import fileUpload from "express-fileupload";
import cloudinary from "cloudinary";
import cookieParser from "cookie-parser";

//importing files
import { authRoute, roomRoute, testRoute, userRoute } from "./routes";
import errorHandler from "./middlewares/errorHandler";

const app = express();

// using middlewares
app.use(cookieParser());
app.use(
  cors({
    origin: config.get<string>("frontend_url"),
    credentials: true,
  })
);
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
const fileUploadConfig = {
  useTempFiles: true,
  tempFileDir: "./temp/",
};
app.use(fileUpload(fileUploadConfig));

// cloudinary config
// cloudinary config
cloudinary.v2.config({
  cloud_name: config.get<string>("cloudinary_cloud_name"),
  api_key: config.get<string>("cloudinary_api_key"),
  api_secret: config.get<string>("cloudinary_api_secret"),
});

// api routes
app.use("/api/v1", testRoute);
app.use("/api/v1", authRoute);
app.use("/api/v1", userRoute);
app.use("/api/v1", roomRoute);

// error handler
app.use(errorHandler);

export default app;
