import { CartMongoDAO as CartDAO } from "../dao/CartMongoDAO.js";

class CartService {
  constructor(dao) {
    this.dao = dao;
  }
  getCarts = async () => {
    return await this.dao.getAll();
  };

  getCartById = async (filtro = {}) => {
    return await this.dao.getById(filtro);
  };

  createCart = async () => {
    return await this.dao.create();
  };

  addProductToCart = async (cid, pid) => {
    return await this.dao.addProductToCart(cid, pid);
  };

  updateCart = async (cid, products) => {
    return await this.dao.updateCart(cid, products);
  };

  updateProductQ = async (cid, pid, quantity) => {
    return await this.dao.updateProductQ(cid, pid, quantity);
  };

  deleteAllProductsFromCart = async (cid, pid) => {
    return await this.dao.deleteAllProductsFromCart(cid, pid);
  };

  deleteProductFromCart = async (cid, pid) => {
    return await this.dao.deleteProductFromCart(cid, pid);
  };
}

export const cartService = new CartService(new CartDAO());
