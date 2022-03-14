// importing modules
import { object, string, TypeOf } from "zod";

export const loginSchema = object({
  body: object({
    email: string({
      required_error: "please provide email",
    }).email("please enter a valid email"),
    password: string({
      required_error: "please provide password",
    })
      .min(8, "password should be atleast 8 characters long")
      .max(20, "password should not be longer than 20 characters"),
  }),
});

export type LoginInput = TypeOf<typeof loginSchema>;
