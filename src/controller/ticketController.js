import { ticketService } from "../services/ticketService.js";
import { productService } from "../services/productService.js";
import { isValidObjectId } from "mongoose";
import { sessionService } from "../services/sessionsService.js";

export class TicketController {
  static createTicket = async (req, res) => {
    let { email, ticket } = req.body;

    if (!email || !ticket) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `Complete the data` });
    }

    if (!Array.isArray(ticket)) {
      res.setHeader("Content-Type", "application/json");
      return res.status(400).json({ error: `The ticket has an invalid format` });
    }

    try {
      const user = await sessionService.getUser({ email });
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }

      let total = 0;
      let error = false;
      let detalleError = [];

      for (const e of ticket) {
        if (!isValidObjectId(e.pid)) {
          error = true;
          detalleError.push(`The product with id ${e.pid} is not a valid MONGODB ID`);
          continue;
        }
        let product = await productService.getProductsBy({ _id: e.pid });
        if (product) {
          e.title = product.title;
          e.price = product.price;
          e.subtotal = product.price * e.quantity;
          total += e.subtotal;
        } else {
          error = true;
          detalleError.push(`The product with id ${e.pid} does not exist`);
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
        .json({ message: "Error creating the ticket", detail: `${error.message}` });
    }
  };

  static getTickets = async (req, res) => {
    let tickets = await ticketService.getTickets();
    return res.status(200).json({ tickets });
  };
}
