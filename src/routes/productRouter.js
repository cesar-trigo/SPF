import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { ProductController } from "../controller/productController.js";
import passport from "passport";

export const router = Router();

router.get("/", ProductController.getProducts);
router.get("/mockingproducts", ProductController.mock);
router.get("/:pid", ProductController.getProductsBy);
router.post(
  "/",
  passport.authenticate("jwt", { session: false }),
  auth(["admin"]),
  ProductController.createProduct
);
router.put(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  auth(["admin"]),
  ProductController.updateProduct
);
router.delete(
  "/:pid",
  passport.authenticate("jwt", { session: false }),
  auth(["admin"]),
  ProductController.deleteProduct
);
