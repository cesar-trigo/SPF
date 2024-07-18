import { lookToken } from "../config/passport.js";
import { cartService } from "../services/cartService.js";
import { productService } from "../services/productService.js";
import { UsersDTO } from "../dto/UsersDTO.js";
import { CustomError } from "../utils/customError.js";
import { ERROR_TYPES } from "../utils/eErrors.js";
import { error } from "console";

export class ViewController {
  static home = async (req, res, next) => {
    let products;
    const token = lookToken(req);
    try {
      products = await productService.getProducts();
    } catch (error) {
      next(error);
    }

    res.setHeader("Content-Type", "text/html");
    res.status(200).render("home", { products, login: token });
  };

  static realTime = async (req, res, next) => {
    let products;
    try {
      products = await productService.getProducts();
    } catch (error) {
      next(error);
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).render("realTime", { products, login: req.user });
  };

  static chat = (req, res) => {
    res.status(200).render("chat", { login: req.user });
  };

  static getProductsPaginate = async (searchQuery, options) => {
    return productService.getProductsPaginate(searchQuery, options);
  };

  static buildLinks = (req, sort, products) => {
    const { prevPage, nextPage } = products;
    const baseUrl = req.originalUrl.split("?")[0];
    const sortParam = sort ? `&sort=${sort}` : "";

    const prevLink = prevPage ? `${baseUrl}?page=${prevPage}${sortParam}` : null;
    const nextLink = nextPage ? `${baseUrl}?page=${nextPage}${sortParam}` : null;

    return {
      prevPage: prevPage ? parseInt(prevPage) : null,
      nextPage: nextPage ? parseInt(nextPage) : null,
      prevLink,
      nextLink,
    };
  };

  static getProducts = async (req, res, next) => {
    const cartUser = req.user.cart;
    try {
      /*       let cart = await cartService.getCartById(cartUser);
      if (!cart) {
        cart = await cartService.createCart();
      } */

      const { page = 1, limit = 5, sort } = req.query;

      const options = {
        page: Number(page),
        limit: Number(limit),
        lean: true,
      };

      const searchQuery = {};

      if (req.query.category) {
        searchQuery.category = req.query.category;
      }

      if (req.query.title) {
        searchQuery.title = { $regex: req.query.title, $options: "i" };
      }

      if (req.query.stock) {
        const stockNumber = parseInt(req.query.stock);
        if (!isNaN(stockNumber)) {
          searchQuery.stock = stockNumber;
        }
      }

      if (sort === "asc" || sort === "desc") {
        options.sort = { price: sort === "asc" ? 1 : -1 };
      }

      const products = await ViewController.getProductsPaginate(searchQuery, options);
      const { prevPage, nextPage, prevLink, nextLink } = ViewController.buildLinks(
        req,
        sort,
        products,
        products
      );
      const categories = await productService.getCategories();

      let requestedPage = parseInt(page);
      if (isNaN(requestedPage)) {
        CustomError.createError(
          "getProducts from ViewController",
          "Page not found",
          "Page must be a number",
          ERROR_TYPES.INVALID_ARGUMENTS
        );
      }

      if (requestedPage < 1) {
        requestedPage = 1;
      }

      if (requestedPage > products.totalPages) {
        CustomError.createError(
          "getProducts from ViewController",
          "Page not found",
          "Sorry, the site does not have that many pages yet",
          ERROR_TYPES.INVALID_ARGUMENTS
        );
      }

      res.render("products", {
        status: "success",
        payload: products.docs,
        totalPages: products.totalPages,
        page: requestedPage,
        hasPrevPage: products.hasPrevPage,
        hasNextPage: products.hasNextPage,
        prevPage,
        nextPage,
        prevLink,
        nextLink,
        categories,
        cartUser,
        login: req.user,
      });
    } catch (error) {
      next(error);
    }
  };

  static getCart = async (req, res) => {
    const cid = req.params.cid;
    const cart = await cartService.getCartById({ _id: cid });

    if (cart) {
      const plainCart = cart.toObject();
      res.status(200).render("cart", { plainCart, login: req.user });
    } else {
      CustomError.createError(
        "getCart from ViewController",
        "Enter a valid cart id",
        `Cart not found with id: ${cid}`,
        ERROR_TYPES.NOT_FOUND
      );
    }
  };

  static register = (req, res) => {
    res.setHeader("Content-Type", "text/html");
    let { error } = req.query;
    res.status(200).render("register", { error });
  };

  static login = (req, res) => {
    res.setHeader("Content-Type", "text/html");
    let { error } = req.query;
    res.status(200).render("login", { error });
  };

  static current = (req, res) => {
    const { user } = req;
    const userDto = new UsersDTO(user);
    res.setHeader("Content-Type", "text/html");
    res.status(200).render("profile", {
      user: userDto,
      login: req.user,
    });
  };
}
