export const router = Router();
import { Router } from "express";
const productManager = new ProductManager();
import ProductManager from "../dao/ProductManagerMONGO.js";
import CartManager from "../dao/CartManagerMONGO.js";
import { productsModelo } from "../dao/models/productsModelo.js";
import UserManager from "../dao/UserManager.js";
/* import { auth, admin } from '../middleware/auth.js'; */
import { io } from "../app.js";
import passport from "passport";
import { vistasController } from "../controller/vistasControllers.js";

const cartManager = new CartManager();

const userManager = new UserManager();

router.get("/", vistasController.getProducts);

router.get(
  "/realtimeproducts",
  passport.authenticate("jwt", { session: false }),
  vistasController.realtimeproducts
);

router.get("/chat", vistasController.chat);

router.get(
  "/products",
  passport.authenticate("jwt", { session: false }),
  vistasController.getProductsPaginate
);

router.get(
  "/carts/:cid",
  passport.authenticate("jwt", { session: false }),
  vistasController.getCartById
);

router.get("/register", vistasController.register);

router.get("/login", vistasController.login);

router.get("/logout", vistasController.logout);

router.get("/current", passport.authenticate("jwt", { session: false }), vistasController.current);

router.get("/github", passport.authenticate("github", { scope: ["user:email"] }));

router.get("/callbackGithub", passport.authenticate("github", { failureRedirect: "/login" }));
