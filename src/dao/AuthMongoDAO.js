import { userModelo } from "./models/userModelo.js";

export class AuthMongoDAO {
  async registerUser(user) {
    return await userModelo.create({ ...user });
  }
}
