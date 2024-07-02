import { CartMongoDAO as CartDAO } from "../dao/CartMongoDAO.js";

class CartService {
  constructor(dao) {
    this.dao = dao;
  }
  getCarts = async () => {
    return await this.dao.getCarts();
  };

  getCartById = async (filter = {}) => {
    return await this.dao.getCartById(filter);
  };

  createCart = async () => {
    return await this.dao.createCart();
  };

  addProductToCart = async (cid, pid) => {
    return await this.dao.addProductToCart(cid, pid);
  };

  updateCart = async (cid, products) => {
    return await this.dao.updateCart(cid, products);
  };

  updateCartProductQ = async (cid, pid, quantity) => {
    return await this.dao.updateProductQ(cid, pid, quantity);
  };

  deleteAllProductsFromCart = async cid => {
    return await this.dao.deleteAllProductsFromCart(cid);
  };

  deleteProductFromCart = async (cid, pid) => {
    return await this.dao.deleteProductFromCart(cid, pid);
  };
}

export const cartService = new CartService(new CartDAO());
