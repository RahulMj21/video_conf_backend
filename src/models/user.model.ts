// importing modules
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import config from "config";
import crypto from "crypto";

const Schema = mongoose.Schema;

export interface UserInput {
  name: string;
  email: string;
  password: string;
}
export interface GoogleUserInput {
  name: string;
  email: string;
  avatar: {
    public_id: string;
    secure_url: string;
  };
  isLoggedInWithGoogle: boolean;
}

export interface UserDocument extends UserInput, mongoose.Document {
  avatar: {
    public_id: string;
    secure_url: string;
  };
  isLoggedInWithGoogle: Boolean;
  role: string;
  forgotPasswordToken: string;
  forgotPasswordHash: string;
  forgotPasswordExpiry: Number;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(password: string): Promise<Boolean>;
  getForgotPasswordToken(): string;
}

const userSchema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    avatar: {
      public_id: { type: String, default: "" },
      secure_url: { type: String, default: "" },
    },
    isLoggedInWithGoogle: { type: Boolean, default: false },
    role: { type: String, default: "User" },
    forgotPasswordToken: { type: String, required: false },
    forgotPasswordHash: { type: String, required: false },
    forgotPasswordExpiry: { type: Number, required: false },
  },
  {
    timestamps: true,
  }
);

// hashing the password before creating the user
userSchema.pre("save", async function (next) {
  const user = this as UserDocument;
  if (!user.isModified("password")) return next();
  user.password = await bcrypt.hash(user.password, config.get<number>("salt"));
  return next();
});

// compare password
userSchema.methods.comparePassword = async function (password: string) {
  const user = this as UserDocument;
  const result = await bcrypt
    .compare(password, user.password)
    .catch((err: any) => false);
  return result;
};

// forgot password
userSchema.methods.getForgotPasswordToken = async function () {
  const user = this as UserDocument;
  const randomString = crypto.randomBytes(20).toString("hex");
  const expiry = Date.now() + 1000 * 60 * 5;
  const data = `${randomString}.${expiry}`;

  const hash = crypto
    .createHmac("sha256", config.get<string>("forgot_password_token_secret"))
    .update(data)
    .digest("hex");

  user.forgotPasswordToken = randomString;
  user.forgotPasswordHash = hash;
  user.forgotPasswordExpiry = expiry;
  user.save();

  return randomString;
};

// defining the model from the userSchema
const userModel = mongoose.model<UserDocument>("User", userSchema);

// exporting the model
export default userModel;
