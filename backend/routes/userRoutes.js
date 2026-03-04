import express from "express";
const router = express.Router();

import {
  createUser,
  loginUser,
  logoutCurrentUser,
  getAllUsers,
  getCurrentUserProfile,
  updateCurrentUserProfile,
  deleteUserById,
  getUserById,
  updateUserById,
  getAllDoctors,
  verifyEmail,
  createProfile,
  resendVerification,
  forgotPassword,
  resetPassword,
  checkVerified,
  addDoctorReview,
  updateDoctorAvailability   // ✅ import your controller
} from "../controllers/userController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Public routes
router.route("/").post(createUser);
router.route("/auth").post(loginUser);
router.route("/logout").post(logoutCurrentUser);
router.route("/verify-email").get(verifyEmail);
router.route("/resend-verification").post(resendVerification);
router.route("/forgot-password").post(forgotPassword);
router.route("/reset-password/:token").post(resetPassword);
router.route("/verify").get(authenticate, checkVerified);

// Authenticated user routes
router.route("/profile")
  .get(authenticate, getCurrentUserProfile)
  .put(authenticate, updateCurrentUserProfile)
  .post(authenticate, createProfile);

// ✅ Doctor availability route
router.route("/doctors/availability").put(authenticate, updateDoctorAvailability);

// Admin routes
router.route("/")
  .get(authenticate, authorizeAdmin, getAllUsers);

router.route("/doctors").get(getAllDoctors);
router.route("/:id/add-doctor-review").post(authenticate, addDoctorReview);

router.route("/:id")
  .delete(authenticate, authorizeAdmin, deleteUserById)
  .get(getUserById)
  .put(authenticate, authorizeAdmin, updateUserById);

export default router;