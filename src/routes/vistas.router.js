export const router = Router();
import { Router } from "express";
const productManager = new ProductManager();
import ProductManager from "../dao/ProductManagerMONGO.js";
import CartManager from "../dao/CartManagerMONGO.js";
import { productsModelo } from "../dao/models/productsModelo.js";
import UserManager from "../dao/UserManager.js";
/* import { auth, admin } from '../middleware/auth.js'; */
import { io } from "../app.js";
import passport from "passport";

const cartManager = new CartManager();

const userManager = new UserManager();

router.get("/", async (req, res) => {
  let products;
  try {
    products = await productManager.getProducts();
  } catch {
    res.setHeader("Content-Type", "application/json");
    return res.status(500).json({
      error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
    });
  }
  res.setHeader("Content-Type", "text/html");
  res.status(200).render("home", { products, user: "user" });
});

router.get(
  "/realtimeproducts",
  passport.authenticate("jwt", { session: false }),
  async (req, res) => {
    let products;
    try {
      products = await productManager.getProducts();
    } catch (error) {
      console.log(error);
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Error inesperado en el servidor - Intente más tarde, o contacte a su administrador`,
      });
    }
    res.setHeader("Content-Type", "text/html");
    res.status(200).render("realTime", { products });
  }
);

router.get("/chat", (req, res) => {
  res.status(200).render("chat");
});

const getProductsPaginate = async (searchQuery, options) => {
  return productManager.getProductsPaginate(searchQuery, options);
};

const buildLinks = (req, sort, products) => {
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

router.get("/products", passport.authenticate("jwt", { session: false }), async (req, res) => {
  try {
    let cart = await cartManager.getCartsBy();
    if (!cart) {
      cart = await cartManager.create();
    }

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

    const products = await getProductsPaginate(searchQuery, options);
    const { prevPage, nextPage, prevLink, nextLink } = buildLinks(req, sort, products, products);
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
});

router.get("/carts/:cid", passport.authenticate("jwt", { session: false }), async (req, res) => {
  const cid = req.params.cid;

  const cart = await cartManager.getCartsBy({ _id: cid });

  if (cart) {
    res.status(200).render("cart", { cart });
  } else {
    res.status(404).json({ error: `Cart not found with id: ${cid}` });
  }
});

router.get("/register", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  let { error } = req.query;
  res.status(200).render("register", { error });
});

/* router.post('/register', async (req, res) => {
    
    try {
        const {first_name, last_name , email, password, age} = req.body

        const user = await userManager.registerUser({...req.body})
    
        if (user) {
            req.session.user = {first_name, last_name, email, age};
            req.session.rol = user.role;
        }
        res.redirect('/login')
    } catch (error) {
        req.session.error = error.message
        res.redirect('/register')
    }
});
 */
router.get("/login", (req, res) => {
  res.setHeader("Content-Type", "text/html");
  let { error } = req.query;
  res.status(200).render("login", { error });
});

/* router.post('/login', async (req, res) => {
    const {email, password} = req.body

    const user = await userManager.getUserEmail(email)

    if (user && user.password === password) {
        const userName = `${user.first_name} ${user.last_name}`
        req.session.user = {name: userName, first_name: user.first_name, last_name: user.last_name, email: user.email, age: user.age};
        req.session.rol = user.role;
        setTimeout(() => {
            io.emit('bienvenido', req.session.user.name);
        }, 500);
        return res.redirect('/products')
    }
    return res.redirect('/login')
}); */

router.get("/logout", (req, res) => {
  req.cookies.destroy();
  res.redirect("/login");
});

router.get("/current", passport.authenticate("jwt", { session: false }), (req, res) => {
  const { user } = req;
  res.setHeader("Content-Type", "text/html");
  res.status(200).render("profile", {
    user: user,
  });
});

router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] }),
  async (req, res) => {}
);

router.get(
  "/callbackGithub",
  passport.authenticate("github", { failureRedirect: "/login" }),
  async (req, res) => {
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
  }
);
