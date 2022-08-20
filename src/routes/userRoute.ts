// importing modules
import express from "express";

//importing files
import UserController from "../controllers/user.controller";
import deserializeUser from "../middlewares/deserializeUser";
import validateResources from "../middlewares/validateResources";
import { resetPasswordSchema } from "../schemas/resetPassword";
import { updatePasswordSchema } from "../schemas/updatePassword.schema";

const router = express.Router();

// get routes
router.route("/me").get(deserializeUser, UserController.getCurrentUser);
router.route("/users").get(deserializeUser, UserController.getAllUsers);
router.route("/user/:id").get(deserializeUser, UserController.getSingleUser);
router.route("/forgotpassword").post(UserController.forgotPassword);

// put routes
router
  .route("/updateprofile")
  .put(deserializeUser, UserController.updateProfile);
router
  .route("/updatepassword")
  .put(
    deserializeUser,
    validateResources(updatePasswordSchema),
    UserController.updatePassword
  );
router
  .route("/resetpassword/:token")
  .put(validateResources(resetPasswordSchema), UserController.resetPassword);

export default router;
