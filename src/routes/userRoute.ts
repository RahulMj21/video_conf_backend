// importing modules
import express from "express";

//importing files
import UserController from "../controllers/user.controller";

const router = express.Router();

// get routes
router.route("/me").get(UserController.getCurrentUser);
router.route("/users").get(UserController.getAllUsers);
router.route("/user/:id").get(UserController.getSingleUser);
router.route("/user/:id").get(UserController.forgotPassword);

// put routes
router.route("/user/updateprofile").put(UserController.updateProfile);
router.route("/user/updatepassword").put(UserController.updateProfile);
router.route("/user/resetpassword").put(UserController.resetPassword);

export default router;
