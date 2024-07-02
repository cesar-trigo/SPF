import { Router } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import { CartController } from "../controller/cartController.js";
import CartManager from "../dao/CartManagerMONGO.js";
import ProductManager from "../dao/ProductManagerMONGO.js";
import { auth } from "../middleware/auth.js";
import passport from "passport";

export const router = Router();

router.get("/", CartController.getCart);
router.get("/:cid", CartController.getOneCart);
router.post("/", CartController.createCart);
router.post(
  "/:cid/products/:pid",
  passport.authenticate("jwt", { session: false }),
  auth(["user"]),
  CartController.addProductToCart
);
router.put("/:cid", CartController.updateCart);
router.put("/:cid/products/:pid", CartController.updateCartProductQuantity);
router.delete("/:cid", CartController.deleteCart);
router.delete("/:cid/products/:pid", CartController.deleteCartProduct);
router.get(
  "/:cid/purchase",
  passport.authenticate("jwt", { session: false }),
  auth(["user"]),
  CartController.purchase
);
router.post(
  "/:cid/purchase",
  passport.authenticate("jwt", { session: false }),
  auth(["user"]),
  CartController.purchase
);
