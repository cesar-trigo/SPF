import { authService } from "../services/authService.js";
import { createHash } from "../utils.js";
import { config } from "../config/config.js";
import jwt from "jsonwebtoken";
import { io } from "../app.js";

export class AuthController {
  static register = async (req, res) => {
    //arreglo
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

      const newProduct = await authService.register(newUser);
      return res.redirect("/login");
    } catch (error) {
      throw error;
    }
  };

  static login = async (req, res) => {
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
        cart: req.user.cart,
        role: req.user.role,
      };
      res.cookie("coderCookie", token, { httpOnly: true });

      return res.redirect("/products"), { token, userToken };
    } catch (error) {
      throw error;
    }
  };
}
