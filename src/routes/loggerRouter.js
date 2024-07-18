import { loggerController } from "../controller/loggerController.js";
import { middlewareLogger } from "../utils/loggers.js";
import { Router } from "express";
export const router = Router();

router.get("/", middlewareLogger, loggerController);
