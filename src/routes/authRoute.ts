// importing modules
import express from "express";

// importing files
import AuthController from "../controllers/auth.controller";

const router = express.Router();

// post routes
router.route("/register").post(AuthController.register);
router.route("/login").post(AuthController.login);

// get routes
router.route("/logout").get(AuthController.logout);

export default router;
