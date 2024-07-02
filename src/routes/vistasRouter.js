import { Router } from "express";
export const router = Router();
import passport from "passport";
import { ViewController } from "../controller/viewController.js";
import { auth } from "../middleware/auth.js";

router.get("/", ViewController.home);
router.get(
  "/realtimeproducts",
  passport.authenticate("jwt", { session: false }),
  ViewController.realTime
);
router.get(
  "/chat",
  passport.authenticate("current", { session: false }),
  auth(["user"]),
  ViewController.chat
);
router.get(
  "/products",
  passport.authenticate("jwt", { session: false }),
  ViewController.getProducts
);
router.get("/carts/:cid", passport.authenticate("jwt", { session: false }), ViewController.getCart);
router.get("/register", ViewController.register);
router.get("/login", ViewController.login);
router.get(
  "/current",
  passport.authenticate("jwt", { session: false }),
  auth(["admin", "user"]),
  ViewController.current
);
