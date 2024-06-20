import dotenv from "dotenv";
import { Command, Option } from "commander";
import path from "path";
import __dirname from "../utils.js";

let program = new Command();

program.addOption(
  new Option("-m, --mode <modo>", "Script execution mode").choices(["dev", "prod"]).default("dev")
);
program.parse();

const argument = program.opts();
const mode = argument.mode;

const envPath =
  mode === "prod" ? path.join(__dirname, "./.env.dev") : path.join(__dirname, "./.env.prod");

dotenv.config({
  path: envPath,
  override: true,
});

export const config = {
  PORT: process.env.PORT || 3000,
  MONGO_URL: process.env.MONGO_URL,
  SECRET_KEY: process.env.SECRET_KEY,
  CLIENT_ID_GITHUB: process.env.CLIENT_ID_GITHUB,
  CLIENT_SECRET_GITHUB: process.env.CLIENT_SECRET_GITHUB,
};
