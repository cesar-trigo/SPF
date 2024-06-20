import { isValidObjectId } from "mongoose";
import { cartService } from "../services/cartService.js";
import { productService } from "../services/productService.js";

export class cartController {
  static getCarts = async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const cart = await cartService.getCarts();

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static getCartById = async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const cid = req.params.cid;

      if (!isValidObjectId(cid)) {
        return res.status(400).json({
          error: `Enter a valid MongoDB ID`,
        });
      }

      const cart = await cartService.getCartById({ _id: cid });
      if (cart) {
        res.status(200).json(cart);
      } else {
        return res.status(404).json({ error: `No cart exists with the ID: ${cid}` });
      }
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static createCart = async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const newCart = await cartService.createCart();
      res.status(200).json(newCart);
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static addProductToCart = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({
        error: `Enter a valid MongoDB ID`,
      });
    }

    let productExists = await productService.getProductsById({ _id: pid });
    if (!productExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No product exists with the ID: ${pid}` });
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `No cart exists with the ID: ${cid}` });
    }
    try {
      let result = await cartService.addProductToCart(cid, pid);
      res.status(200).json({ success: true, message: "Product added successfully", result });
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static updateCart = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    let cid = req.params.cid;
    let products = req.body;
    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        error: `Enter a valid MongoDB ID`,
      });
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `No cart exists with the ID: ${cid}` });
    }

    try {
      const newCart = await cartService.updateCart(cid, products);
      return res.status(200).json(newCart);
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static updateProductQ = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;
    let { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({
        error: `Enter a valid MongoDB ID`,
      });
    }

    let productExists = await productService.getProductsById({ _id: pid });
    if (!productExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No product exists with the ID: ${pid}` });
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `No cart exists with the ID: ${cid}` });
    }

    try {
      const result = await cartService.updateProductQ(cid, pid, quantity);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static deleteAllProductsFromCart = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const cid = req.params.cid;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({
        error: `Enter a valid MongoDB ID`,
      });
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `No cart exists with the ID: ${cid}` });
    }

    try {
      let cartDeleted = await cartManager.deleteAllProductsFromCart(cid);
      if (cartDeleted) {
        res.status(200).json({ message: "All products removed from cart", cartDeleted });
      } else {
        res.status(404).json({ message: "Cart not found" });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error - Try again later, or contact your administrator`,
        detail: `${error.message}`,
      });
    }
  };

  static deleteProductFromCart = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({
        error: `Enter a valid MongoDB ID`,
      });
    }

    let productExists = await productService.getProductsById({ _id: pid });
    if (!productExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No product exists with the ID: ${pid}` });
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `No product exists with the ID: ${cid}` });
    }

    try {
      const cart = await cartService.deleteProductFromCart(cid, pid);

      if (cart) {
        res.status(200).json({ message: "Product removed from cart", cart });
      } else {
        res.status(404).json({ message: "Cart or product not found" });
      }
    } catch (error) {
      res.status(500).json({ message: "Error deleting product from cart", error });
    }
  };
}
