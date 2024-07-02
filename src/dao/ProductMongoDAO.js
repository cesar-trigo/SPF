import { productsModelo } from "./models/productsModelo.js";

export class ProductMongoDAO {
  getProducts = async () => {
    return await productsModelo.find().lean();
  };

  getProductsPaginate = async (filter, options) => {
    return await productsModelo.paginate(filter, options);
  };

  getProductsBy = async filter => {
    return await productsModelo.findOne(filter).lean();
  };

  createProduct = async product => {
    const newProduct = await productsModelo.create(product);
    return newProduct.toJSON();
  };

  updateProduct = async (id, product) => {
    return await productsModelo.findByIdAndUpdate(id, product, {
      runValidators: true,
      returnDocument: "after",
    });
  };

  deleteProduct = async id => {
    return await productsModelo.deleteOne({ _id: id });
  };

  getCategories = async () => {
    return await productsModelo.distinct("category");
  };
}
