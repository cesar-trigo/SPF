export const router = Router();
import { Router } from "express";
import { io } from "../app.js";
import UserManager from "../dao/UserManager.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import CartManager from "../dao/CartManagerMONGO.js";

import { config } from "../config/config.js";
import { AuthController } from "../controller/authController.js";

/* const userManager = new UserManager();
const cartManager = new CartManager();
 */
router.post(
  "/register",
  AuthController.register
  // passport.authenticate requiere dos argumentos, nombre de la estrategia y failureRedirect que redirecciona si no se autentica
  /*   passport.authenticate("register", { failureRedirect: "/register" }), */
);

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login", session: false }),
  AuthController.login
);

/* router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/api/sessions/github",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      email: req.user.email,
      role: req.user.role,
    };
    return res.redirect("/products");
  }
); */
