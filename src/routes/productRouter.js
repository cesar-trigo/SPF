import { isValidObjectId } from "mongoose";
import { Router } from "express";
import { io } from "../app.js";
import ProductManager from "../dao/ProductManagerMONGO.js";
import { productController } from "../controller/productController.js";
const productManager = new ProductManager();
export const router = Router();

router.get("/", productController.getProducts);

router.get("/:pid", productController.getProductById);

router.post("/", productController.createProduct);

router.put("/:pid", productController.updateProduct);

router.delete("/:pid", productController.deleteProduct);
