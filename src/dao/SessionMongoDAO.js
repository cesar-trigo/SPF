import { userModelo } from "../dao/models/userModelo.js";

export class SessionMongoDAO {
  async createSession(session) {
    const user = await userModelo.create(session);
    return user.toJSON();
  }

  async getUser(user) {
    return await userModelo.findOne({ email: user.email }).lean();
  }
}
