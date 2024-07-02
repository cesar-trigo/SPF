import { SessionMongoDAO as SessionDAO } from "../dao/SessionMongoDAO.js";

class SessionsService {
  constructor(dao) {
    this.dao = dao;
  }
  createUser = async user => {
    return await this.dao.createSession(user);
  };

  getUser = async user => {
    return await this.dao.getUser(user);
  };
}

export const sessionService = new SessionsService(new SessionDAO());
