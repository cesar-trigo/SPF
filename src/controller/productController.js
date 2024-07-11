import { isValidObjectId } from "mongoose";
import { io } from "../app.js";
import { productService } from "../services/productService.js";

export class ProductController {
  // Función estática para obtener productos con paginación
  static getProductsFunction = async ({ baseUrl, page = 1, limit = 5, sort, ...searchQuery }) => {
    // Configuración de opciones de paginación
    const options = {
      page: Number(page),
      limit: Number(limit),
      lean: true,
    };

    // Configuración de la ordenación si se especifica
    if (sort === "asc" || sort === "desc") {
      options.sort = { price: sort === "asc" ? 1 : -1 };
    }

    // Obtener productos paginados desde el gestor de productos
    const products = await productService.getProductsPaginate(searchQuery, options);

    // Construir enlaces de paginación
    const links = ProductController.buildLinks(baseUrl, sort, products);

    const requestedPage = Number(page);
    // Validación de la página solicitada
    if (isNaN(requestedPage) || requestedPage < 1 || requestedPage > products.totalPages) {
      return { error: "La página solicitada está fuera de rango" };
    }

    // Retornar la respuesta con los productos y la información de paginación
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

  // Función estática para construir los enlaces de paginación
  static buildLinks = (baseUrl, sort, products) => {
    const { prevPage, nextPage } = products;
    const sortParam = sort ? `&sort=${sort}` : "";

    return {
      prevPage: prevPage ? parseInt(prevPage) : null,
      nextPage: nextPage ? parseInt(nextPage) : null,
      prevLink: prevPage ? `${baseUrl}?page=${prevPage}${sortParam}` : null,
      nextLink: nextPage ? `${baseUrl}?page=${nextPage}${sortParam}` : null,
    };
  };

  // Función estática para manejar la solicitud de obtener productos
  static getProducts = async (req, res, next) => {
    try {
      const baseUrl = req.originalUrl.split("?")[0]; // Obtener la URL base sin los parámetros de consulta
      const { page, limit, sort, ...searchQuery } = req.query; // Obtener parámetros de consulta de la solicitud

      // Llamar a la función de obtener productos con los parámetros de consulta
      const products = await ProductController.getProductsFunction({
        baseUrl,
        page,
        limit,
        sort,
        ...searchQuery,
      });
      res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };

  // Método estático para obtener un producto por indentificador
  static getProductsBy = async (req, res, next) => {
    // Obtiene el ID del producto de los parámetros de la solicitud
    let id = req.params.pid;
    // Verifica si el ID proporcionado es válido
    if (!isValidObjectId(id)) {
      CustomError.createError(
        "getProductsBy from productController",
        "Enter a valid MongoDB ID",
        "ID inválido",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    } //
    try {
      res.setHeader("Content-Type", "application/json");
      // Llama al servicio para obtener el producto por indentificador
      const product = await productService.getProductsBy({ _id: id });
      // Si el producto existe, responde con el producto y un estado 200
      if (product) {
        res.status(200).json(product);
      } else {
        CustomError.createError(
          "getProductsBy from productController",
          "Enter a valid MongoDB ID",
          `No product exists with the ID: ${pid}`,
          ERROR_TYPES.INVALID_ARGUMENTS
        );
      }
    } catch (error) {
      next(error);
    }
  };

  // Método estático para crear un nuevo producto
  static createProduct = async (req, res, next) => {
    try {
      const { title, description, price, thumbnail, code, stock, category } = req.body;

      if (!title || !description || !price || !thumbnail || !code || !stock || !category) {
        CustomError.createError(
          "createProduct from productController",
          "Enter a valid MongoDB ID",
          "All fields are required",
          ERROR_TYPES.INVALID_ARGUMENTS
        );
      }

      if (typeof price !== "number" || typeof stock !== "number") {
        return res.status(400).json({ error: "Price and stock must be numbers" });
      }

      const productExists = await productService.getProductsBy({ code });

      if (productExists) {
        return res.status(400).json({ error: `Error, the code ${code} is repeating` });
      }

      const newProduct = await productService.createProduct({
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

  // Método estático para actualizar un producto
  static updateProduct = async (req, res, next) => {
    // Obtiene el ID del producto de los parámetros de la solicitud
    let id = req.params.pid;

    try {
      // Verifica si el ID proporcionado es válido
      if (!isValidObjectId(id)) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ error: "Enter a valid MONGODB ID" });
      }

      res.setHeader("Content-Type", "application/json");
      let stock, price, category, thumbnail, title, description;
      // Extrae los datos de actualización del cuerpo de la solicitud
      let updateData = req.body;

      // Si el objeto de actualización contiene un _id, se elimina
      if (updateData._id) {
        delete updateData._id;
      }

      // Si el objeto de actualización contiene un código, se verifica si ya existe otro producto con ese código
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
        // Intenta actualizar el producto llamando al servicio correspondiente
        const productModified = await productService.updateProduct(id, updateData);
        return res.status(200).json(productModified);
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

  // Método estático para eliminar un producto
  static deleteProduct = async (req, res, next) => {
    const productId = req.params.pid;

    if (!isValidObjectId(productId)) {
      return res.status(400).json({ error: "Enter a valid MongoDB ID" });
    }

    const product = await productService.getProductsBy({ _id: productId });
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

  static mock = async (req, res, next) => {
    try {
      let products = [],
        number = 1;
      for (let i = 0; i < 100; i++) {
        products.push({
          productNumber: number++,
          status: faker.datatype.boolean(0.9),
          title: faker.commerce.productName(),
          description: faker.commerce.productDescription(),
          price: faker.commerce.price({ symbol: "$" }),
          thumbnail: faker.image.url(),
          code: `${Date.now()}-${Math.random().toString(36).substring(2, 9)}`,
          stock: faker.number.int({ min: 0, max: 100 }),
          category: faker.commerce.department(),
        });
      }
      return res.status(200).json(products);
    } catch (error) {
      next(error);
    }
  };
}
