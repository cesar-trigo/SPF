import { ticketModelo } from "./models/ticketModelo.js";

export default class TicketManager {
  createTicket = async ticket => {
    let newTicket = await ticketModelo.create(ticket);
    return newTicket.toJSON();
  };

  getTickets = async () => {
    return await ticketModelo.find().populate("purchaser").lean();
  };
}

export const ticketManager = new TicketManager();
