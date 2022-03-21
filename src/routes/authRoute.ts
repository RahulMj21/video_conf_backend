// importing modules
import express from "express";

// importing files
import AuthController from "../controllers/auth.controller";
import validateResources from "../middlewares/validateResources";
import { registerSchema } from "../schemas/register.schema";

const router = express.Router();

// post routes
router.route("/register").post(validateResources(registerSchema),AuthController.register);
router.route("/login").post(AuthController.login);

// get routes
router.route("/logout").get(AuthController.logout);

export default router;
