import { cartModelo } from "./models/cartModelo.js";

export class CartMongoDAO {
  async getAll() {
    return await cartModelo.find().lean();
  }

  async getById(filtro = {}) {
    return await cartModelo.findOne(filtro).populate("products.product").lean();
  }

  async create() {
    return await cartModelo.create({ products: [] });
  }

  async addProductToCart(cid, pid) {
    return await cartModelo.findOneAndUpdate(
      { _id: cid },
      { $push: { products: { product: pid, quantity: 1 } } },
      { new: true }
    );
  }

  async updateCart(cid, products) {
    return await cartModelo.findOneAndUpdate(
      { _id: cid },
      { $set: { products: products } },
      { new: true }
    );
  }

  async updateProductQ(cid, pid, quantity) {
    return await cartModelo.findOneAndUpdate(
      { _id: cid, "products.product": pid },
      { $set: { "products.$.quantity": quantity } },
      { new: true }
    );
  }

  async deleteAllProductsFromCart(cid, pid) {
    return await cartModelo.findOneAndUpdate(
      { _id: cid },
      { $pull: { products: { product: pid } } },
      { new: true }
    );
  }

  async deleteProductFromCart(cid, pid) {
    return await cartModelo.findOneAndUpdate(
      { _id: cid },
      { $pull: { products: { product: pid } } },
      { new: true }
    );
  }
}
