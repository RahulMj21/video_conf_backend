// importing modules
import { object, string, TypeOf } from "zod";

export const registerSchema = object({
  body: object({
    name: string({
      required_error: "please provide name",
    })
      .min(3, "name should be atleast 3 characters long")
      .max(20, "name should not be longer than 20 characters"),
    email: string({
      required_error: "please provide email",
    }).email("please enter a valid email"),
    password: string({
      required_error: "please provide password",
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

export type RegisterInput = TypeOf<
  Omit<typeof registerSchema, "body.confirmPassword">
>;
