// importing modules
import { FilterQuery, DocumentDefinition } from "mongoose";

// importing files
import Session, {
  SessionDocument,
  SessionInput,
} from "../models/session.model";

// methods[services]
class SessionService {
  upsertSession = async (
    query: FilterQuery<SessionDocument>,
    input: DocumentDefinition<SessionInput>
  ) => {
    try {
      const session = await Session.findOneAndUpdate(query, input, {
        new: true,
        upsert: true,
      });
      return session.toJSON();
    } catch (error: any) {
      return false;
    }
  };

  findSession = async (query: FilterQuery<SessionDocument>) => {
    try {
      const session = await Session.findOne(query);
      return session?.toJSON();
    } catch (error: any) {
      return false;
    }
  };
}

export default new SessionService();
