import { cartService } from "../services/cartService.js";
import { productService } from "../services/productService.js";
import { isValidObjectId } from "mongoose";
import { io } from "../app.js";
import { ticketService } from "../services/ticketService.js";

export class CartController {
  static getCart = async (req, res) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const cart = await cartService.getCarts();

      res.status(200).json(cart);
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static getOneCart = async (req, res) => {
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

    const productExists = await productService.getProductsBy({ _id: pid });
    if (!productExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `No product exists with the ID: ${pid}` });
    }

    const cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      res.setHeader("Content-Type", "application/json");
      return res.status(404).json({ error: `No cart exists with the ID: ${cid}` });
    }

    try {
      let result = await cartService.addProductToCart(cartExists, pid);
      res
        .status(200)
        .json({ success: true, message: "Product added successfully", result: result });
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static updateCart = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const cid = req.params.cid;
    const products = req.body;
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

  static updateCartProductQuantity = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;
    let { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({
        error: `Enter a valid MongoDB ID`,
      });
    }

    let productExists = await productService.getProductsBy({ _id: pid });
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
      const result = await cartService.updateCartProductQ(cid, pid, quantity);
      return res.status(200).json(result);
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static deleteCart = async (req, res) => {
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
      let cartDeleted = await cartService.deleteAllProductsFromCart(cid);
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

  static deleteCartProduct = async (req, res) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      return res.status(400).json({
        error: `Enter a valid MongoDB ID`,
      });
    }

    let productExists = await productService.getProductsBy({ _id: pid });
    if (!productExists) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(400)
        .json({ error: `No product exists with the ID: ${pid}, ${productExists}` });
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

  static purchase = async (req, res) => {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      return res.status(400).json({ error: "Invalid cart ID" });
    }

    try {
      const cart = await cartService.getCartById({ _id: cid });

      if (!cart) {
        return res.status(404).json({ error: `Cart with ID ${cid} not found` });
      }

      const productsInCart = cart.products;
      let productsToBill = [];
      let remainingProducts = [];

      for (let product of productsInCart) {
        const {
          product: { _id: pid },
          quantity,
        } = product;

        if (!isValidObjectId(pid)) {
          return res.status(400).json({ error: `Invalid product ID: ${pid}` });
        }

        const productData = await productService.getProductsBy({ _id: pid });

        if (!productData) {
          return res.status(404).json({ error: `Product with ID ${pid} not found` });
        }

        if (productData.stock < quantity) {
          remainingProducts.push(product);
        } else {
          const newStock = productData.stock - quantity;
          await productService.updateProduct(pid, { stock: newStock });

          productsToBill.push({
            product: productData,
            quantity,
          });
        }
      }

      const totalAmount = productsToBill.reduce(
        (total, item) => total + item.product.price * item.quantity,
        0
      );
      const ticket = await ticketService.createTicket({
        code: `T-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
        purchase_datetime: new Date(),
        purchaser: req.user.email,
        products: productsToBill.map(item => ({
          pid: item.product._id,
          title: item.product.title,
          price: item.product.price,
          quantity: item.quantity,
          subtotal: item.product.price * item.quantity,
        })),
        amount: totalAmount,
      });

      await cartService.updateCart(cid, remainingProducts);

      return res.status(200).json({
        message: "Purchase completed successfully",
        products: productsToBill,
        remainingProducts,
        ticket,
      });
    } catch (error) {
      return res.status(500).json({ error: "Unexpected server error", detail: error.message });
    }
  };
}
