import { Router } from "express";
import mongoose, { isValidObjectId } from "mongoose";
import CartManager from "../dao/CartManagerMONGO.js";
import ProductManager from "../dao/ProductManagerMONGO.js";

import { cartController } from "../controller/cartController.js";

export const router = Router();
const cartManager = new CartManager();
const productManager = new ProductManager();

router.get("/", cartController.getCarts);

router.get("/:cid", cartController.getCartById);

router.post("/", cartController.createCart);

router.post("/:cid/products/:pid", cartController.addProductToCart);

router.put("/:cid", cartController.updateCart);

router.put("/:cid/products/:pid", cartController.updateProductQ);

router.delete("/:cid", cartController.deleteAllProductsFromCart);

router.delete("/:cid/products/:pid", cartController.deleteProductFromCart);
