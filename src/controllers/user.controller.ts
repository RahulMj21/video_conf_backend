// importing modules
import { Request, Response, NextFunction } from "express";
import { get, omit } from "lodash";
import cloudinary from "cloudinary";
import config from "config";

// importing files
import BigPromise from "../utils/BigPromise";
import CustomErrorHandler from "../utils/CustomErrorHandler";
import User from "../services/user.service";
import { UpdatePasswordInput } from "../schemas/updatePassword.schema";
import { ResetPasswordInput } from "../schemas/resetPassword";
import { z } from "zod";
import sendMail from "../utils/sendMail";

class UserController {
  getAllUsers = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const users = await User.findAllUsers({});
      if (!users) return next(CustomErrorHandler.notFound("users not found"));

      return res.status(200).json({
        success: true,
        users,
      });
    }
  );
  getSingleUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const _id = get(req, "params.id");
      if (!_id)
        return next(
          CustomErrorHandler.badRequest("user id is not present on the request")
        );

      const user = await User.findUser({ _id });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      return res.status(200).json({
        success: true,
        user: omit(user.toJSON(), [
          "password",
          "_v",
          "forgotPasswordToken",
          "forgotPasswordHash",
          "forgotPasswordExpiry",
        ]),
      });
    }
  );
  getCurrentUser = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const decodedUser = get(res, "locals.user");

      const user = await User.findUser({ _id: decodedUser._id });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      return res.status(200).json({
        success: true,
        user: omit(user.toJSON(), [
          "password",
          "updatedAt",
          "__v",
          "forgotPasswordToken",
          "forgotPasswordHash",
          "forgotPasswordExpiry",
        ]),
      });
    }
  );
  updateProfile = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const decodedUser = get(res, "locals.user");
      // get the name email avatar? from the req.body
      const avatar = get(req, "files.avatar") || get(req, "body.avatar");
      const { email, name }: { email: string; name: string } = get(req, "body");
      if (!email && !name && !avatar)
        return next(CustomErrorHandler.badRequest("nothing to update"));

      // validating email if present
      if (email) {
        const EmailSchema = z.string().email("please enter a valid email");
        try {
          EmailSchema.parse(email);
        } catch (error: any) {
          const err = JSON.parse(error.message);
          return next(new CustomErrorHandler(422, err[0].message));
        }
      }

      // find the user
      const user = await User.findUser({ _id: decodedUser._id });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      // handling avatar
      if (avatar) {
        // removing the previus img from cloudinary
        if (user.avatar.public_id !== "") {
          const destroyedImg = await cloudinary.v2.uploader.destroy(
            user.avatar.public_id
          );
          if (!destroyedImg) return next(CustomErrorHandler.wentWrong());
        }

        // adding new img in cloudinary
        const uploadableFile =
          typeof avatar === "object" ? avatar.tempFilePath : avatar;
        const result = await cloudinary.v2.uploader.upload(uploadableFile, {
          folder: "/video_conf/users",
          width: 200,
          scale: "crop",
        });
        if (!result) return next(CustomErrorHandler.wentWrong());

        // updating avatar
        user.avatar = {
          public_id: result.public_id,
          secure_url: result.secure_url,
        };
      }
      // updating details
      user.email = email ? email : user.email;
      user.name = name ? name : user.name;
      await user.save({ validateBeforeSave: false });

      // send response
      return res.status(200).json({
        success: true,
        message: "profile updated",
      });
    }
  );
  updatePassword = BigPromise(
    async (
      req: Request<{}, {}, UpdatePasswordInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      // getting user from cookie
      const decodedUser = get(res, "locals.user");

      // check if the new password is same with the old password
      if (req.body.password === req.body.newPassword)
        return next(CustomErrorHandler.badRequest("nothing to update"));

      // find the user in db
      const user = await User.findUser({ _id: decodedUser._id });
      if (!user) return next(CustomErrorHandler.notFound("user not found"));

      // update password
      user.password = req.body.newPassword;
      user.save();

      return res
        .status(200)
        .json({ success: true, message: "password updated" });
    }
  );
  forgotPassword = BigPromise(
    async (req: Request, res: Response, next: NextFunction) => {
      const email = get(req, "body.email");
      if (!email)
        return next(
          CustomErrorHandler.badRequest("please provide your authorized email")
        );

      // check if the user exists in db
      const user = await User.findUser({ email });
      if (!user)
        return next(CustomErrorHandler.badRequest("email is not registered"));

      const forgotPasswordToken = await user.getForgotPasswordToken();

      // send email logic will goes here ; 👇👇👇👇👇👇👇👇
      const link = `${config.get<string>(
        "frontend_url"
      )}/resetpassword/${forgotPasswordToken}`;
      const data = {
        to: email,
        subject: "Password reset link from video_conf app.",
        html: `<p>Click this below link or copy & paste the link in your browser</p>
                <p><a href=${link}>${link}</a></p>  
        `,
      };
      const info = await sendMail(data);
      if (!info) return next(CustomErrorHandler.wentWrong());

      // sending response
      return res.status(200).json({
        success: true,
        message: "check your email",
      });
    }
  );
  resetPassword = BigPromise(
    async (
      req: Request<{}, {}, ResetPasswordInput["body"]>,
      res: Response,
      next: NextFunction
    ) => {
      // getting forgotPasswordToken from req.params
      const token = get(req, "params.token");
      if (!token)
        return next(
          CustomErrorHandler.badRequest("password reset token is required")
        );

      // get the user from db
      const user = await User.findUser({ forgotPasswordToken: token });
      if (!user) return next(CustomErrorHandler.unauthorized());

      // check if the token expired
      if (user.forgotPasswordExpiry <= Date.now())
        return next(
          CustomErrorHandler.badRequest("password reset token expired")
        );

      // update password
      user.password = req.body.newPassword;
      await user.save();

      return res.status(200).json({
        success: true,
        message: "password updated successfully",
      });
    }
  );
}

export default new UserController();
