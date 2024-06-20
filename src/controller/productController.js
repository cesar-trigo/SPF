import { isValidObjectId } from "mongoose";
import { productService } from "../services/productService.js";

export class productController {
  getProducts = async ({ baseUrl, page = 1, limit = 5, sort, ...searchQuery }) => {
    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true,
    };

    if (sort === "asc" || sort === "desc") {
      options.sort = { price: sort === "asc" ? 1 : -1 };
    }

    const products = await productService.getProductsPaginate(searchQuery, options);
    const links = this.buildLinks(baseUrl, sort, products);

    const requestedPage = Number(page);
    if (isNaN(requestedPage) || requestedPage < 1) {
      return res.status(404).json({ error: "La página solicitada está fuera de rango" });
    }

    if (requestedPage > products.totalPages) {
      return res.status(404).json({ error: "La página solicitada está fuera de rango" });
    }

    return {
      status: "success",
      payload: products.docs,
      totalPages: products.totalPages,
      page: requestedPage,
      hasPrevPage: products.hasPrevPage,
      hasNextPage: products.hasNextPage,
      ...links,
    };
  };

  buildLinks = (baseUrl, sort, products) => {
    const { prevPage, nextPage } = products;
    const sortParam = sort ? `&sort=${sort}` : "";

    return {
      prevPage: prevPage ? parseInt(prevPage) : null,
      nextPage: nextPage ? parseInt(nextPage) : null,
      prevLink: prevPage ? `${baseUrl}?page=${prevPage}${sortParam}` : null,
      nextLink: nextPage ? `${baseUrl}?page=${nextPage}${sortParam}` : null,
    };
  };

  static getProducts = async (req, res) => {
    try {
      const baseUrl = req.originalUrl.split("?")[0];
      const { page, limit, sort, ...searchQuery } = req.query;
      const products = await this.getProducts({ baseUrl, page, limit, sort, ...searchQuery });
      res.status(200).json(products);
    } catch (error) {
      res.status(500).json({ error: "Error interno del servidor" });
    }
  };

  static getProductById = async (req, res) => {
    let id = req.params.pid;
    if (!isValidObjectId(id)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Enter a valid MONGODB ID` });
    }
    try {
      res.setHeader("Content-Type", "application/json");
      const product = await productService.getProductsById({ _id: id });

      if (product) {
        res.status(200).json(product);
      } else {
        return res.status(404).json({ error: `No product exists with the ID: ${id}` });
      }
    } catch (error) {
      res.status(500).json({ error: `Unexpected server error`, detail: `${error.message}` });
    }
  };

  static createProduct = async (req, res) => {
    try {
      const { title, description, price, thumbnail, code, stock, category } = req.body;

      if (!title || !description || !price || !thumbnail || !code || !stock || !category) {
        return res.status(400).json({ error: "All fields are required" });
      }

      if (typeof price !== "number" || typeof stock !== "number") {
        return res.status(400).json({ error: "Price and stock must be numbers" });
      }

      const productExists = await productService.getProductsBy({ code });

      if (productExists) {
        return res.status(400).json({ error: `Error, the code ${code} is repeating` });
      }

      const newProduct = await productService.addProduct({
        title,
        description,
        price,
        thumbnail,
        code,
        stock,
        category,
      });

      io.emit("newProduct", newProduct);

      res.status(201).json(newProduct);
    } catch (error) {
      res.status(500).json({
        error: `Unexpected server error`,
        detalle: `${error.message}`,
      });
    }
  };

  static updateProduct = async (req, res) => {
    let id = req.params.pid;

    try {
      if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Enter a valid MONGODB ID" });
      }

      res.setHeader("Content-Type", "application/json");
      let stock, price, category, thumbnail, title, description;
      let updateData = req.body;

      if (updateData._id) {
        delete updateData._id;
      }

      if (updateData.code) {
        let exist;

        try {
          exist = await productService.getProductsBy({ code: updateData.code });
          if (exist) {
            res.setHeader("Content-Type", "application/json");
            return res
              .status(400)
              .json({ error: `Another product with code ${updateData.code} already exists` });
          }
        } catch (error) {
          res.setHeader("Content-Type", "application/json");
          return res.status(500).json({
            error: `${error.message}`,
          });
        }
      }

      if ((stock !== undefined && isNaN(stock)) || (price !== undefined && isNaN(price))) {
        return res.status(400).json({ error: "Stock and price must be numbers" });
      }

      try {
        let productoModificado = await productService.updateProduct(id, updateData);
        return res.status(200).json(`product ${id} has been modified: ${productoModificado}`);
      } catch (error) {
        res.status(300).json({ error: `Error modifying the product` });
      }
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res.status(500).json({
        error: `Unexpected server error`,
        detalle: `${error.message}`,
      });
    }
  };

  static deleteProduct = async (req, res) => {
    const productId = req.params.pid;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: "Enter a valid MongoDB ID" });
    }

    const product = await productService.getProductsById({ _id: productId });
    if (!product) {
      return res.status(404).json({ error: `No product found with ID: ${productId}` });
    }

    try {
      const result = await productService.deleteProduct(productId);
      const products = await productService.getProducts();
      if (result.deletedCount > 0) {
        io.emit("deleteProduct", products);
        return res.status(200).json({ payload: `Product with id ${productId} has been deleted` });
      } else {
        return res.status(400).json({ error: `No product found with id ${productId}` });
      }
    } catch (error) {
      return res.status(500).json({
        error: "Unexpected server error",
        detail: error.message,
      });
    }
  };
}
