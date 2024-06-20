import { config } from "../config/config.js";
import crypto from "crypto";

export const generaHash = password =>
  crypto.createHmac("sha256", config.SECRET_KEY).update(password).digest("hex");
