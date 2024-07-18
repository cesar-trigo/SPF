import { ERROR_TYPES } from "../utils/eErrors.js";

export const errorHandler = (error, req, res, next) => {
  console.log(`${error.Msg ? error.Msg : error.message}`);

  switch (error.code) {
    case ERROR_TYPES.AUTHORIZATION || ERROR_TYPES.AUTHENTICATION:
      res.setHeader("Content-Type", "application/json");
      return res.status(401).json({ error: "Incorrect credentials" });

    case ERROR_TYPES.INVALID_ARGUMENTS:
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `${error.message}` });

    case ERROR_TYPES.NOT_FOUND:
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `${error.message}` });

    default:
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({ error: "Internal Server Error - Contact Administrator" });
  }
};
