import UserManager from "../dao/UsersDAO.js";
import { ticketService } from "../services/ticketService.js";
import { productService } from "../services/productService.js";
import { isValidObjectId } from "mongoose";
import { sessionService } from "../services/sessionsService.js";

export class TicketController {
  static createTicket = async (req, res) => {
    let { email, ticket } = req.body;

    if (!email || !ticket) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Complete los datos` });
    }

    if (!Array.isArray(ticket)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `El ticket tiene un formato inválido` });
    }

    try {
      const user = await sessionService.getUser({ email });
      if (!user) {
        return res.status(404).json({ message: "Usuario no encontrado" });
      }

      let total = 0;
      let error = false;
      let detalleError = [];

      for (const t of ticket) {
        if (!isValidObjectId(t.pid)) {
          error = true;
          detalleError.push(`El producto con id ${t.pid} no es un ID válido de MONGODB`);
          continue;
        }
        let product = await productService.getProductsBy({ _id: t.pid });
        if (product) {
          t.title = product.title;
          t.price = product.price;
          t.subtotal = product.price * t.quantity;
          total += t.subtotal;
        } else {
          error = true;
          detalleError.push(`El producto con id ${t.pid} no existe`);
        }
      }

      if (error) {
        res.setHeader("Content-Type", "application/json");
        return res.status(400).json({ errors: detalleError });
      }

      const code = `T-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const purchase_datetime = new Date();

      let newTicket = await ticketService.createTicket({
        code,
        purchase_datetime,
        purchaser: user.email,
        products: ticket,
        amount: total,
      });

      res.status(201).json(newTicket);
    } catch (error) {
      res.setHeader("Content-Type", "application/json");
      return res
        .status(500)
        .json({ message: "Error al crear el ticket", detalle: `${error.message}` });
    }
  };

  static getTickets = async (req, res) => {
    let tickets = await ticketService.getTickets();
    return res.status(200).json({ tickets });
  };
}
