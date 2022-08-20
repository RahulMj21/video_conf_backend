// importing modules
import { object, string, TypeOf } from "zod";

export const updatePasswordSchema = object({
  body: object({
    password: string({
      required_error: "please provide password",
    })
      .min(8, "password should be atleast 8 characters long")
      .max(20, "password should not be longer than 20 characters"),
    newPassword: string({
      required_error: "please provide new password",
    })
      .min(8, "new password should be atleast 8 characters long")
      .max(20, "new password should not be longer than 20 characters"),
    confirmNewPassword: string({
      required_error: "please provide confirm new password",
    }),
  }).refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "new password and confirm new password mismatched",
    path: ["confirmNewPassword"],
  }),
});

export type UpdatePasswordInput = TypeOf<
  Omit<typeof updatePasswordSchema, "body.confirmNewPassword">
>;
