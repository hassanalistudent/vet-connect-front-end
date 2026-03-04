import express from "express";
import {
  createTicket,
  getAllTickets,
  getTicketById,
  updateTicket,
  addResponse,
  getUserTickets,
} from "../controllers/customerSupportController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// User creates ticket
router.post("/", authenticate, createTicket);

// Admin gets all tickets
router.get("/", authenticate, authorizeAdmin, getAllTickets);

// Get tickets for logged-in user
router.get("/mytickets", authenticate, getUserTickets);

// Get single ticket
router.get("/:id", authenticate, getTicketById);

// Admin updates ticket (status/assignment)
router.put("/:id", authenticate, authorizeAdmin, updateTicket);

// Add response to ticket (admin/staff)
router.post("/:id/responses", authenticate, addResponse);



export default router;