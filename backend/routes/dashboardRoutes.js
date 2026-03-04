// backend/routes/dashboardRoutes.js
import express from "express";
import { 
  getDoctorDashboard, 
  getAdminDashboard,
  getDoctorDashboardStats,
  getDoctorAppointmentTrends,
  getDoctorAlerts,
  getVerificationQueue,
  getTopDoctors
} from "../controllers/dashboardController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Doctor dashboard routes
router.get("/doctor", authenticate, getDoctorDashboard);
router.get("/doctor/stats", authenticate, getDoctorDashboardStats);
router.get("/doctor/trends", authenticate,  getDoctorAppointmentTrends);
router.get("/doctor/alerts", authenticate,  getDoctorAlerts);
router.post("/doctor/refresh", authenticate,  (req, res) => {
  // Just invalidate cache on frontend, this endpoint can be a simple 200
  res.json({ success: true, message: "Cache invalidated" });
});

// Admin dashboard routes
router.get("/admin", authenticate, authorizeAdmin, (req, res) => {
  getAdminDashboard(req, res);
});
router.get("/admin/verification-queue", authenticate, authorizeAdmin, getVerificationQueue);
router.get("/admin/top-doctors", authenticate, authorizeAdmin, getTopDoctors);
router.post("/admin/refresh", authenticate, authorizeAdmin, (req, res) => {
  res.json({ success: true, message: "Cache invalidated" });
});

export default router;