import { cartService } from "../services/cartService.js";
import { productService } from "../services/productService.js";
import { isValidObjectId } from "mongoose";
import { io } from "../app.js";
import { ticketService } from "../services/ticketService.js";
import { CustomError } from "../utils/customError.js";
import { ERROR_TYPES } from "../utils/eErrors.js";

export class CartController {
  static getCart = async (req, res, next) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const cart = await cartService.getCarts();

      res.status(200).json(cart);
    } catch (error) {
      next(error);
    }
  };

  static getOneCart = async (req, res, next) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const cid = req.params.cid;

      if (!isValidObjectId(cid)) {
        CustomError.createError(
          "getOneCart from cartController",
          "Enter a valid MongoDB ID",
          "ID inválido",
          ERROR_TYPES.INVALID_ARGUMENTS
        );
      }
      const cart = await cartService.getCartById({ _id: cid });
      if (cart) {
        res.status(200).json(cart);
      } else {
        CustomError.createError(
          "getCartById from cartController",
          "Enter a valid MongoDB ID",
          `No cart exists with the ID: ${cid}`,
          ERROR_TYPES.INVALID_ARGUMENTS
        );
      }
    } catch (error) {
      next(error);
    }
  };

  static createCart = async (req, res, next) => {
    try {
      res.setHeader("Content-Type", "application/json");
      const newCart = await cartService.createCart();
      res.status(200).json(newCart);
    } catch (error) {
      next(error);
    }
  };

  static addProductToCart = async (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      CustomError.createError(
        "addProductToCart from cartController",
        "Enter a valid MongoDB ID",
        "ID inválido",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    const productExists = await productService.getProductsBy({ _id: pid });
    if (!productExists) {
      res.setHeader("Content-Type", "application/json");
      CustomError.createError(
        "productExists from cartController",
        "Enter a valid MongoDB ID",
        `No product exists with the ID: ${pid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }
    const cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      CustomError.createError(
        "getCartById from cartController",
        "Enter a valid MongoDB ID",
        `No cart exists with the ID: ${cid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    try {
      let result = await cartService.addProductToCart(cartExists, pid);
      res
        .status(200)
        .json({ success: true, message: "Product added successfully", result: result });
    } catch (error) {
      next(error);
    }
  };

  static updateCart = async (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    const cid = req.params.cid;
    const products = req.body;
    if (!isValidObjectId(cid)) {
      CustomError.createError(
        "updateCart from cartController",
        "Enter a valid MongoDB ID",
        "ID inválido",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      CustomError.createError(
        "cartExists from cartController",
        "Enter a valid MongoDB ID",
        `No cart exists with the ID: ${cid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    try {
      const newCart = await cartService.updateCart(cid, products);
      return res.status(200).json(newCart);
    } catch (error) {
      next(error);
    }
  };

  static updateCartProductQuantity = async (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;
    let { quantity } = req.body;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      CustomError.createError(
        "updateCartProductQuantity from cartController",
        "Enter a valid MongoDB ID",
        "ID inválido",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    let productExists = await productService.getProductsBy({ _id: pid });
    if (!productExists) {
      CustomError.createError(
        "productExists from cartController",
        "Enter a valid MongoDB ID",
        `No product exists with the ID: ${pid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      CustomError.createError(
        "cartExists from cartController",
        "Enter a valid MongoDB ID",
        `No cart exists with the ID: ${cid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    try {
      const result = await cartService.updateCartProductQ(cid, pid, quantity);
      return res.status(200).json(result);
    } catch (error) {
      next(error);
    }
  };

  static deleteCart = async (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    const cid = req.params.cid;

    if (!isValidObjectId(cid)) {
      CustomError.createError(
        "deleteCart from cartController",
        "Enter a valid MongoDB ID",
        "ID inválido",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      CustomError.createError(
        "deleteCart from cartController",
        "Enter a valid MongoDB ID",
        `No cart exists with the ID: ${cid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    try {
      let cartDeleted = await cartService.deleteAllProductsFromCart(cid);
      if (cartDeleted) {
        res.status(200).json({ message: "All products removed from cart", cartDeleted });
      } else {
        CustomError.createError(
          "cartDeleted from cartController",
          "Enter a valid MongoDB ID",
          "Cart not found",
          ERROR_TYPES.NOT_FOUND
        );
      }
    } catch (error) {
      next(error);
    }
  };

  static deleteCartProduct = async (req, res, next) => {
    res.setHeader("Content-Type", "application/json");
    const { cid, pid } = req.params;

    if (!isValidObjectId(cid) || !isValidObjectId(pid)) {
      CustomError.createError(
        "deleteCartProduct from cartController",
        "Enter a valid MongoDB ID",
        "ID inválido",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    let productExists = await productService.getProductsBy({ _id: pid });
    if (!productExists) {
      CustomError.createError(
        "productExists from cartController",
        "Enter a valid MongoDB ID",
        `No product exists with the ID: ${pid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    let cartExists = await cartService.getCartById({ _id: cid });
    if (!cartExists) {
      CustomError.createError(
        "cartExists from cartController",
        "Enter a valid MongoDB ID",
        `No cart exists with the ID: ${cid}`,
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    try {
      const cart = await cartService.deleteProductFromCart(cid, pid);

      if (cart) {
        res.status(200).json({ message: "Product removed from cart", cart });
      } else {
        CustomError.createError(
          "deleteCartProduct from cartController",
          "Enter a valid MongoDB ID",
          "Cart or product not found",
          ERROR_TYPES.NOT_FOUND
        );
      }
    } catch (error) {
      next(error);
    }
  };

  static purchase = async (req, res, next) => {
    const { cid } = req.params;

    if (!isValidObjectId(cid)) {
      CustomError.createError(
        "purchase from cartController",
        "Enter a valid MongoDB ID",
        "ID inválido",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    try {
      const cart = await cartService.getCartById({ _id: cid });

      if (!cart) {
        CustomError.createError(
          "purchase from cartController",
          "Enter a valid MongoDB ID",
          `No cart exists with the ID: ${cid}`,
          ERROR_TYPES.INVALID_ARGUMENTS
        );
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
          CustomError.createError(
            "purchase from cartController",
            "Enter a valid MongoDB ID",
            "ID inválido",
            ERROR_TYPES.INVALID_ARGUMENTS
          );
        }

        const productData = await productService.getProductsBy({ _id: pid });

        if (!productData) {
          CustomError.createError(
            "purchase from cartController",
            "Enter a valid MongoDB ID",
            `Product with ID ${pid} not found`,
            ERROR_TYPES.INVALID_ARGUMENTS
          );
        } //

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
      next(error);
    }
  };
}
