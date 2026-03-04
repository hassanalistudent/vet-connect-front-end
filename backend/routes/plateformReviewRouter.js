import express from "express";
import {
  createReview,
  getAllReviews,
  getReviewById,
  deleteReview,
} from "../controllers/plateformReviewController.js";
import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Create review
router.route("/").post(authenticate, createReview);

// Get all reviews
router.route("/").get( getAllReviews);

// Get single review
router.route("/:id").get(authenticate, getReviewById);

// Delete review
router.route("/:id").delete(authenticate,authorizeAdmin, deleteReview);

export default router;