import asyncHandler from "express-async-handler";
import PlatformReview from "../models/plateformReview.js";

// ✅ Create a new review
const createReview = asyncHandler(async (req, res) => {
  const { appointmentId, doctorId, rating, comment } = req.body;

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      success: false,
      error: "Authentication required. Please login again.",
    });
  }

  // ✅ Check if user already reviewed this doctor for this appointment
  const existingReview = await PlatformReview.findOne({
    doctorId,
    ownerId: req.user._id,
    appointmentId,
  });

  if (existingReview) {
    return res.status(400).json({
      success: false,
      error: "You have already reviewed this appointment/doctor.",
    });
  }

  // ✅ Create new review
  const review = await PlatformReview.create({
    appointmentId,
    doctorId,
    ownerId: req.user._id,
    rating,
    comment,
  });

  res.status(201).json({
    success: true,
    message: "Review created successfully",
    review,
  });
});

// ✅ Get single review by ID
const getReviewById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await PlatformReview.findById(id)
    .populate("ownerId", "name email")
    .populate("doctorId", "name email");

  if (!review) {
    return res.status(404).json({
      success: false,
      error: "Review not found",
    });
  }

  res.status(200).json({
    success: true,
    review,
  });
});

// ✅ Delete a review
const deleteReview = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const review = await PlatformReview.findById(id);

  if (!review) {
    return res.status(404).json({
      success: false,
      error: "Review not found",
    });
  }

  // Only owner or admin can delete
  if (review.ownerId.toString() !== req.user._id.toString() && !req.user.isAdmin) {
    return res.status(403).json({
      success: false,
      error: "Not authorized to delete this review",
    });
  }

  await review.deleteOne();

  res.status(200).json({
    success: true,
    message: "Review deleted successfully",
  });
});

// ✅ Get all reviews (admin view)
const getAllReviews = asyncHandler(async (req, res) => {
  const reviews = await PlatformReview.find({})
    .populate("ownerId", "name ")   // show pet owner info
    .populate("doctorId", "name ")  // show doctor info
    .populate("appointmentId", "appointmentDate appointmentTime");

  res.status(200).json({
    success: true,
    count: reviews.length,
    reviews,
  });
});

export {
  getAllReviews,
  getReviewById,
  deleteReview,
  createReview,
};