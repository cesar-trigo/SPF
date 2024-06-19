export const router = Router();
import { Router } from "express";
import { io } from "../app.js";
import UserManager from "../dao/UserManager.js";
import passport from "passport";
import jwt from "jsonwebtoken";
import CartManager from "../dao/CartManagerMONGO.js";

const userManager = new UserManager();
const cartManager = new CartManager();

router.post(
  "/register",
  // passport.authenticate requiere dos argumentos, nombre de la estrategia y failureRedirect que redirecciona si no se autentica
  /*   passport.authenticate("register", { failureRedirect: "/register" }), */
  async (req, res) => {
    const { first_name, last_name, email, age, password } = req.body;

    try {
      /*       if (!req.user) {
        return res.redirect("/register");
      } */

      const newUser = {
        first_name,
        last_name,
        email,
        age,
        password: await createHash(password),
      };

      const cart = await cartManager.createCart(); // creo el carrito
      newUser.cart = cart._id; // asigno el id del carrito

      const newProduct = await userManager.registerUser(newUser);
      return res.redirect("/login");
    } catch (error) {
      throw error;
    }
  }
);

router.post(
  "/login",
  passport.authenticate("login", { session: false, failureRedirect: "/login" }),
  async (req, res) => {
    try {
      if (!req.user) {
        return res.redirect("/login");
      }

      setTimeout(() => {
        io.emit("bienvenido", req.user.first_name);
      }, 500);

      const token = jwt.sign(
        {
          first_name: req.user.first_name,
          last_name: req.user.last_name,
          email: req.user.email,
          age: req.user.age,
          role: req.user.role,
          cart: req.user.cart,
          id: req.user.id,
        },
        SECRET,
        { expiresIn: "8h" }
      );
      let userToken = {
        id: req.user._id,
        first_name: req.user.name,
        lastname: req.user.lastname,
        email: req.user.email,
        photo: req.user.photo,
        age: req.user.age,
        events: req.user.events,
        role: req.user.role,
      };
      res.cookie("coderCookie", token, { httpOnly: true });

      return res.redirect("/products"), { token, userToken };
    } catch (error) {
      throw error;
    }
  }
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
