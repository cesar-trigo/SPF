import { cartModelo } from "./models/cartModelo.js";

export class CartMongoDAO {
  getCarts = async () => {
    return await cartModelo.find().populate("products.product").lean();
  };

  getCartById = async (filter = {}) => {
    return await cartModelo.findById(filter).populate("products.product");
  };

  createCart = async () => {
    const cart = await cartModelo.create({ products: [] });
    return cart.toJSON();
  };

  addProductToCart = async (cart, pid) => {
    const existingProductIndex = cart.products.findIndex(
      product => product.product._id.toString() === pid
    );

    existingProductIndex !== -1
      ? cart.products[existingProductIndex].quantity++
      : cart.products.push({ product: pid, quantity: 1 });

    await cart.save();
    return cart;
  };

  updateCart = async (cid, products) => {
    const cart = await cartModelo.findByIdAndUpdate(
      cid,
      { $set: { products: products } },
      { returnDocument: "after" }
    );

    return cart;
  };

  updateProductQ = async (cid, pid, quantity) => {
    const cart = await cartModelo
      .findOneAndUpdate(
        { _id: cid, "products.product": pid },
        { $set: { "products.$.quantity": quantity } },
        { new: true }
      )
      .populate("products.product");
    return cart;
  };

  deleteAllProductsFromCart = async cid => {
    const cart = await cartModelo
      .findOneAndUpdate({ _id: cid }, { $set: { products: [] } }, { new: true })
      .populate("products.product");
    return cart;
  };

  deleteProductFromCart = async (cid, pid) => {
    const cart = await cartModelo
      .findByIdAndUpdate(cid, { $pull: { products: { product: pid } } }, { new: true })
      .populate("products.product");

    return cart;
  };
}
