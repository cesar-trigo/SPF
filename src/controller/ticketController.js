import { ticketService } from "../services/ticketService.js";
import { productService } from "../services/productService.js";
import { isValidObjectId } from "mongoose";
import { sessionService } from "../services/sessionsService.js";
import { ERROR_TYPES } from "../utils/eErrors.js";
import { CustomError } from "../utils/customError.js";

export class TicketController {
  static createTicket = async (req, res, next) => {
    let { email, ticket } = req.body;

    if (!email || !ticket) {
      CustomError.createError(
        "createTicket from ticketController",
        "Enter a valid MongoDB ID",
        "All fields are required",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    if (!Array.isArray(ticket)) {
      CustomError.createError(
        "createTicket from ticketController",
        "Enter a valid MongoDB ID",
        "The ticket has an invalid format",
        ERROR_TYPES.INVALID_ARGUMENTS
      );
    }

    try {
      const user = await sessionService.getUser({ email });
      if (!user) {
        CustomError.createError(
          "createTicket from ticketController",
          "Enter a valid MongoDB code",
          `User not found`,
          ERROR_TYPES.NOT_FOUND
        );
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
        CustomError.createError(
          "createTicket from ticketController",
          "Enter a valid MongoDB ID",
          detalleError,
          ERROR_TYPES.INVALID_ARGUMENTS
        );
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
      next(error);
    }
  };

  static getTickets = async (req, res) => {
    let tickets = await ticketService.getTickets();
    return res.status(200).json({ tickets });
  };
}
