import { ProductMongoDAO as ProductDAO } from "../dao/ProductMongoDAO.js";

class ProductService {
  constructor(dao) {
    this.dao = dao;
  }

  getProducts = async () => {
    return await this.dao.getProducts();
  };

  getProductsPaginate = async () => {
    return await this.dao.getProductsPaginate();
  };

  getProductsById = async filter => {
    return await this.dao.getById(filter);
  };

  getProductsBy = async filter => {
    return await this.dao.getProductsBy(filter);
  };

  addProduct = async product => {
    return await this.dao.addProduct(product);
  };

  updateProduct = async (id, updateData) => {
    return await this.dao.updateProduct(id, updateData);
  };

  deleteProduct = async id => {
    return await this.dao.deleteProduct(id);
  };
}

export const productService = new ProductService(new ProductDAO());
