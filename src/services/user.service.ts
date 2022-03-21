// importing modules
import { omit } from "lodash";
import { DocumentDefinition, FilterQuery } from "mongoose";

// importing files
import User, { UserDocument, UserInput } from "../models/user.model";

// Methods[services]
class UserServices {
  createUser = async (input: DocumentDefinition<UserInput>) => {
    try {
      const user = await User.create(input);
      return omit(user.toJSON(), [
        "password",
        "_v",
        "forgotPasswordToken",
        "forgotPasswordExpiry",
        "forgotPasswordHash",
      ]);
    } catch (error: any) {
      return false;
    }
  };
  findUser = async (query: FilterQuery<UserDocument>) => {
    try {
      const user = await User.findOne(query);
      if (!user) return false;
      return user;
    } catch (error: any) {
      return false;
    }
  };
  findAllUsers = async (query: FilterQuery<UserDocument> | {}) => {
    try {
      const users = await User.find(query);
      if (!users) return false;
      return users.map((user) =>
        omit(user.toJSON(), [
          "password",
          "_v",
          "forgotPasswordToken",
          "forgotPasswordHash",
          "forgotPasswordExpiry",
        ])
      );
    } catch (error: any) {
      return false;
    }
  };
  findUserAndComparePass = async ({
    email,
    password,
  }: {
    email: string;
    password: string;
  }) => {
    try {
      const user = await User.findOne({ email });
      if (!user) return false;
      const isPasswordMatched = user.comparePassword(password);
      if (!isPasswordMatched) return false;

      return omit(user.toJSON(), [
        "password",
        "_v",
        "forgotPasswordToken",
        "forgotPasswordExpiry",
        "forgotPasswordHash",
      ]);
    } catch (error: any) {
      return false;
    }
  };
}

export default new UserServices();
