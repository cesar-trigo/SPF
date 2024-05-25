export const router = Router();
import { Router } from "express";
import { io } from "../app.js";
import UserManager from "../dao/UserManager.js";
import passport from "passport";

const userManager = new UserManager();

router.post(
  "/register",
  passport.authenticate("register", { failureRedirect: "/register" }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/register");
      }
      return res.redirect("/login");
    } catch (error) {
      throw error;
    }
  }
);

router.post(
  "/login",
  passport.authenticate("login", { failureRedirect: "/login" }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/login");
      }

      setTimeout(() => {
        io.emit("bienvenido", req.user.first_name);
      }, 500);

      req.session.user = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        age: req.user.age,
        email: req.user.email,
        role: req.user.role,
      };
      return res.redirect("/products");
    } catch (error) {
      throw error;
    }
  }
);

router.get(
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
);
