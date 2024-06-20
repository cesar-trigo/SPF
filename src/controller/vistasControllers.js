import { isValidObjectId } from "mongoose";
import { productService } from "../services/productService.js";
import { productsModelo } from "../dao/models/productsModelo.js";
import { cartService } from "../services/cartService.js";
import { io } from "../app.js";

export class vistasController {
  static getProducts = async (req, res) => {
    let products;
    try {
      products = await productService.getProducts();
      products = products.map(product => ({
        title: product.title,
        category: product.category,
        price: product.price,
        code: product.code,
        _id: product._id,
      }));
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      });
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).render("home", { products, user: "user" });
  };

  static realtimeproducts = async (req, res) => {
    let products;
    try {
      products = await productService.getProducts();
      products = products.map(product => ({
        title: product.title,
        category: product.category,
        price: product.price,
        code: product.code,
        _id: product._id,
      }));
    } catch (error) {
      console.log(error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      });
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).render("realTime", { products });
  };

  static chat = (req, res) => {
    res.status(200).render("chat");
  };

  static getProductsPaginate = async (req, res) => {
    try {
      const cart = (await productService.getProductsBy()) || (await productService.createCart());

      const { page = 1, limit = 5, sort } = req.query;

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 5,
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

      let products = await productService.getProductsPaginate(searchQuery, options);
      products.docs = products.docs.map(product => ({
        title: product.title,
        category: product.category,
        price: product.price,
        code: product.code,
        _id: product._id,
      }));

      const { prevPage, nextPage, prevLink, nextLink } = vistasController.buildLinks(
        req,
        sort,
        products
      );
      const categories = await productsModelo.distinct("category");

      let requestedPage = parseInt(page);
      if (isNaN(requestedPage)) {
        return res.status(400).json({ error: "Page must be a number" });
      }

      if (requestedPage < 1) {
        requestedPage = 1;
      }

      if (requestedPage > products.totalPages) {
        return res.status(400).json({ error: "Sorry, the site does not have that many pages yet" });
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
        cart,
      });
    } catch (error) {
      console.error("Error:", error);
      res.status(500).json({ error: "Error en el servidor" });
    }
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

  static getCartById = async (req, res) => {
    const cid = req.user.cart;

    const cart = await cartService.getCartById({ _id: cid });

    if (cart) {
      res.status(200).render("cart", { cart });
    } else {
      res.status(404).json({ error: `Cart not found with id: ${cid}` });
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

  static logout = (req, res) => {
    res.clearCookie("codercookie", { httpOnly: true });
    res.redirect("/login");
  };

  static current = (req, res) => {
    const { user } = req;
    res.setHeader("Content-Type", "text/html");
    res.status(200).render("profile", {
      user: user,
    });
  };

  static github = async (req, res) => {};

  static callbackGithub = async (req, res) => {
    if (!req.user) {
      return res.redirect("/login");
    }

    req.session.user = {
      first_name: req.user.first_name,
      last_name: req.user.last_name,
      age: req.user.age,
      email: req.user.email,
      role: req.user.role,
    };
    return res.redirect("/products");
  };
}
