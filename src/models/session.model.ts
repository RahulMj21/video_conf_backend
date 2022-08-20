// importing modules
import mongoose from "mongoose";
import { UserDocument } from "./user.model";

// importing local files

const Schema = mongoose.Schema;

export interface SessionInput {
  user: UserDocument["_id"];
  userAgent: string;
}

export interface SessionDocument extends SessionInput {
  createdAt: Date;
  updatedAt: Date;
}

const sessionSchema = new Schema(
  {
    user: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    userAgent: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

const sessionModel = mongoose.model<SessionDocument>("Session", sessionSchema);
export default sessionModel;
