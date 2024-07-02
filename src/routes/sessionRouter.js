export const router = Router();
import { Router } from "express";
import passport from "passport";
import { sessionController } from "../controller/sessionController.js";

router.post("/register", sessionController.register);
router.post(
  "/login",
  passport.authenticate("login", { session: false, failureRedirect: "/login" }),
  sessionController.login
);
router.get("/logout", sessionController.logout);
// Ruta para autenticación con GitHub
router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));
// Callback de GitHub
router.get(
  "/callbackGitHub",
  passport.authenticate("github", { failureRedirect: "/login", session: false }),
  sessionController.loginGithub
);
