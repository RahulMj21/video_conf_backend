// importing modules
import mongoose from "mongoose";

// importing files
import { UserDocument } from "./user.model";

const Schema = mongoose.Schema;

export interface RoomInput {
  roomName: string;
  roomCreator: UserDocument["_id"];
}
export interface RoomDocument extends RoomInput {
  clients: number;
  createdAt: Date;
  updatedAt: Date;
}

const roomSchema = new Schema(
  {
    roomName: {
      type: String,
      required: true,
    },
    roomCreator: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    clients: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

const roomModel = mongoose.model<RoomDocument>("Room", roomSchema);

export default roomModel;
