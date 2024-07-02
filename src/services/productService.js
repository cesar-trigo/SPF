import { ProductMongoDAO as ProductDAO } from "../dao/ProductMongoDAO.js";
/*
 * Clase que define el servicio de productos
 * El servicio se encarga de manejar la lógica de negocio relacionada con los productos.
 * Se comunica con el Data Access Object (DAO) para interactuar con la base de datos.
 */
class ProductService {
  //Constructor de la clase ProductService
  constructor(dao) {
    this.dao = dao; // Asigna el DAO a una propiedad de la clase
  }
  //Método para obtener todos los productos
  getProducts = async () => {
    return await this.dao.getProducts(); // Llama al método getProducts del DAO
  };

  //Método para obtener productos con paginación y filtros
  getProductsPaginate = async (filter, options) => {
    return await this.dao.getProductsPaginate(filter, options); // Llama al método getProductsPaginate del DAO
  };

  //Método para obtener un producto por su propia identificación
  getProductsBy = async filter => {
    return await this.dao.getProductsBy(filter); // Llama al método getProductsBy del DAO
  };

  //Método para agregar un nuevo producto
  createProduct = async product => {
    return await this.dao.createProduct(product); // Llama al método addProduct del DAO
  };

  //Método para actualizar un producto
  updateProduct = async (id, product) => {
    return await this.dao.updateProduct(id, product); // Llama al método updateProduct del DAO
  };

  //Método para eliminar un producto
  deleteProduct = async id => {
    return await this.dao.deleteProduct(id); // Llama al método deleteProduct del DAO
  };

  //Método para traer categorias
  getCategories = async () => {
    return await this.dao.getCategories(); // Llama al método getCategories del DAO
  };
}

/*
 * Exporta una instancia de ProductService usando ProductDAO
 * Se crea una instancia de ProductService con una instancia de ProductDAO,
 * lo que permite usar los métodos definidos en ProductService para manejar productos.
 */
export const productService = new ProductService(new ProductDAO());
