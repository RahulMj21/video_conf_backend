// importing modules
import { FilterQuery, DocumentDefinition } from "mongoose";

// importing files
import Room, { RoomDocument, RoomInput } from "../models/room.model";

class RoomService {
  async createRoom(input: DocumentDefinition<RoomInput>) {
    try {
      const room = await Room.create(input);
      return room.toJSON();
    } catch (error: any) {
      return false;
    }
  }
  async findAllRooms() {
    try {
      const rooms = await Room.find().select("-clientList").populate({
        path: "roomCreator",
        select: "name _id avatar",
      });
      return rooms.map((room) => room.toJSON());
    } catch (error: any) {
      return false;
    }
  }
  async findSingleRoom(query: FilterQuery<RoomDocument>) {
    try {
      return await Room.findOne(query);
    } catch (error: any) {
      return false;
    }
  }
  async deleteAnyRoom(query: FilterQuery<RoomDocument>) {
    try {
      return await Room.findOneAndDelete(query);
    } catch (error: any) {
      return false;
    }
  }
  async addClient(id: string) {
    const room = await Room.findById(id);
    if (!room) return;
    room.clients = +room.clients + 1;
    room.save();
  }
  async removeClient(id: string) {
    const room = await Room.findById(id);
    if (!room) return;
    room.clients = +room.clients - 1;
    room.save();
  }
}

export default new RoomService();
