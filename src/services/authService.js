import { AuthMongoDAO as AuthDAO } from "../dao/AuthMongoDAO.js";

class AuthService {
  constructor(dao) {
    this.dao = dao;
  }

  register = async user => {
    return await this.dao.register(user);
  };
}

export const authService = new AuthService(new AuthDAO());
