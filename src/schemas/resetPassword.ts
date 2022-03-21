// importing modules
import { object, string, TypeOf } from "zod";

export const resetPasswordSchema = object({
  body: object({
    password: string({
      required_error: "please provide new password",
    })
      .min(8, "password should be atleast 8 characters long")
      .max(20, "password should not be longer than 20 characters"),
    confirmPassword: string({
      required_error: "please provide confirm password",
    }),
  }).refine((data) => data.password === data.confirmPassword, {
    message: "password and confirm password mismatched",
    path: ["confirmPassword"],
  }),
});

export type ResetPasswordInput = TypeOf<typeof resetPasswordSchema>;
