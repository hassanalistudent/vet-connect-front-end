import asyncHandler from "express-async-handler";
import CustomerSupport from "../models/customerSupport.js"

// ✅ Create a new support ticket
export const createTicket = asyncHandler(async (req, res) => {
  const { subject, message, priority } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please login again.",
    });
  }

  const ticket = await CustomerSupport.create({
    userId: req.user._id,
    subject,
    message,
    priority,
  });

  res.status(201).json({
    success: true,
    message: "Support ticket created successfully",
    ticket,
  });
});

// ✅ Get all tickets (admin view)
export const getAllTickets = asyncHandler(async (req, res) => {
  const tickets = await CustomerSupport.find({})
    .populate("userId", "fullName email")
    .populate("assignedTo", "fullName email");

  res.status(200).json({
    success: true,
    count: tickets.length,
    tickets,
  });
});

// ✅ Get single ticket by ID
export const getTicketById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const ticket = await CustomerSupport.findById(id)
    .populate("userId", "fullName email")
    .populate("assignedTo", "fullName email")
    .populate({
      path: "responses.responderId",
      model: "User",
      select: "fullName email role"
    });

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: "Ticket not found",
    });
  }

  // Convert to object and ensure responses are properly populated
  const ticketObj = ticket.toObject();
  
  // Double-check that responses are populated
  if (ticketObj.responses && ticketObj.responses.length > 0) {
    ticketObj.responses = ticketObj.responses.map(response => ({
      ...response,
      responderId: response.responderId || { fullName: 'Unknown User' }
    }));
  }

  res.status(200).json({
    success: true,
    ticket: ticketObj,
  });
});

// ✅ Update ticket status or assign to admin
export const updateTicket = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { status, assignedTo } = req.body;

  const ticket = await CustomerSupport.findById(id);

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: "Ticket not found",
    });
  }

  if (status) ticket.status = status;
  if (assignedTo) ticket.assignedTo = assignedTo;

  await ticket.save();

  res.status(200).json({
    success: true,
    message: "Ticket updated successfully",
    ticket,
  });
});

// ✅ Add a response to a ticket
export const addResponse = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { message } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      error: "Authentication required.",
    });
  }

  const ticket = await CustomerSupport.findById(id);

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: "Ticket not found",
    });
  }

  ticket.responses.push({
    responderId: req.user._id,
    message,
  });

  await ticket.save();

  res.status(200).json({
    success: true,
    message: "Response added successfully",
    ticket,
  });
});

export const getUserTickets = asyncHandler(async (req, res) => {
  const tickets = await CustomerSupport.find({ userId: req.user._id })
    .populate("assignedTo", "fullName email");

  res.status(200).json({
    success: true,
    count: tickets.length,
    tickets,
  });
});