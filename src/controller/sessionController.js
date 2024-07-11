import { cartService } from "../services/cartService.js";
import { sessionService } from "../services/sessionsService.js";
import { createHash } from "../utils.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import { io } from "../app.js";

export class sessionController {
  static register = async (req, res, next) => {
    const { first_name, last_name, email, age, password } = req.body;

    try {
      const newUser = {
        first_name,
        last_name,
        email,
        age,
        password: await createHash(password),
      };

      const cart = await cartService.createCart(); // creo el carrito
      newUser.cart = cart._id; // asigno el id del carrito

      const newProduct = await sessionService.createUser(newUser);
      return res.redirect("/login");
    } catch (error) {
      next(error);
    }
  };

  static login = async (req, res, next) => {
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
        config.SECRET_KEY,
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
      next(error);
    }
  };

  static logout = async (req, res, next) => {
    res.clearCookie("coderCookie", { httpOnly: true });
    res.redirect("/login");
  };

  static loginGithub = async (req, res) => {
    try {
      const tokenUser = {
        first_name: req.user.first_name,
        last_name: req.user.last_name,
        email: req.user.email,
        age: req.user.age,
        role: req.user.role,
        cart: req.user.cart,
        id: req.user._id,
      };

      let token = jwt.sign(tokenUser, config.SECRET_KEY, { expiresIn: "8h" });

      // Configurar la cookie
      res.cookie("coderCookie", token, { httpOnly: true });
      return res.redirect("/products"), { user: req.user };
    } catch (error) {
      next(error);
    }
  };
}
