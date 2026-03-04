import express from "express";
const router = express.Router();

import {
  createAppointment,
  getAppointments,
  getDoctorAppointments,
  getOwnerAppointments,
  getAppointmentById,
  doctorResponse,
  ownerResponse,
  markAppointmentPaid,
  completeAppointment,
  deleteOrCancelAppointment,
  notifyDoctorsAgain,
} from "../controllers/appointmentController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Pet owner creates appointment
router.route("/")
  .post(authenticate, createAppointment);

// Admin gets all appointments (with filters via query)
router.route("/")
  .get(authenticate, authorizeAdmin, getAppointments);
router.route("/notify-doctors")
  .post(authenticate, authorizeAdmin, notifyDoctorsAgain);
// Doctor gets own appointments
router.route("/doctor")
  .get(authenticate, getDoctorAppointments);

// Pet owner gets own appointments
router.route("/owner")
  .get(authenticate, getOwnerAppointments);

// Single appointment: get + cancel
router.route("/:id")
  .get(authenticate, getAppointmentById)
  .put(authenticate, deleteOrCancelAppointment);

// Doctor response (accept / reschedule / cancel)
router.route("/:id/doctor-response")
  .put(authenticate, doctorResponse);

// Pet owner response (accept / cancel)
router.route("/:id/owner-response")
  .put(authenticate, ownerResponse);

// Mark appointment as paid
router.route("/:id/pay")
  .put(authenticate, markAppointmentPaid);

// Complete appointment + create medical history
router.route("/:id/complete")
  .put(authenticate, completeAppointment);

export default router;
