import { fileURLToPath } from "url";
import { dirname } from "path";
import crypto from "crypto";
import bcryptjs from "bcrypt";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

export default __dirname;

export const generaHash = password =>
  crypto.createHmac("sha256", SECRET).update(password).digest("hex");

export const createHash = async password => {
  const salt = await bcryptjs.genSalt(10);
  return bcryptjs.hash(password, salt);
};

export const isValidPassword = async (user, password) => {
  return bcryptjs.compare(password, user.password);
};
