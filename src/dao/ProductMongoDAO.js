import { productsModelo } from "./models/productsModelo.js";

export class ProductMongoDAO {
  async getProducts() {
    return await productsModelo.find().lean();
  }

  async getProductsPaginate(filter, options) {
    // No es necesario usar .lean() aquí porque paginate ya devuelve documentos ligeros si lean es true en options
    return await productsModelo.paginate(filter, options);
  }

  async getById(filter) {
    return await productsModelo.findOne(filter).lean();
  }

  async getProductsBy(filter) {
    return await productsModelo.findOne(filter).lean();
  }

  async addProduct(product) {
    return await productsModelo.create(product);
  }

  async updateProduct(id, updateData) {
    return await productsModelo.findByIdAndUpdate(id, updateData, {
      runValidators: true,
      returnDocument: "after",
    });
  }

  async deleteProduct(id) {
    return await productsModelo.deleteOne({ _id: id });
  }
}
