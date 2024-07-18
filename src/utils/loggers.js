import __dirname from "../utils.js";
import winston from "winston";
import path from "path";
import { config } from "dotenv";

let customLevels = {
  debug: 0,
  http: 1,
  info: 2,
  warning: 3,
  error: 4,
  fatal: 5,
};

const colorMap = {
  debug: "blue",
  http: "cyan",
  info: "green",
  warning: "yellow",
  error: "red",
  fatal: "magenta",
};

const customColors = colorMap;

winston.addColors(customColors);

export const loggerProd = winston.createLogger({
  levels: customLevels,
  transports: [
    new winston.transports.Console({
      level: "info",
      format: winston.format.combine(
        winston.format.colorize({ colors: customColors }),
        winston.format.timestamp(),
        winston.format.simple()
      ),
    }),
    new winston.transports.File({
      filename: path.join(__dirname, "/errors.log"),
      level: "error",
      format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
    }),
  ],
});

export const loggerDev = winston.createLogger({
  levels: customLevels,
  transports: [
    new winston.transports.Console({
      level: "debug",
      format: winston.format.combine(
        winston.format.colorize({ colors: customColors }),
        winston.format.timestamp(),
        winston.format.simple(),
        winston.format.errors({ stack: true })
      ),
    }),
  ],
});

const environment = config.MODE;

export const logger = environment === "dev" ? loggerDev : loggerProd;

export const middlewareLogger = (req, res, next) => {
  req.logger = logger;
  req.logger.http(`${req.method} ${req.url}`);
  next();
};
