import express from "express";
const router = express.Router();

import {
  createPet,
  getPets,
  getPetById,
  updatePet,
  deletePet,
  getUserPets
} from "../controllers/petController.js";

import { authenticate, authorizeAdmin } from "../middlewares/authMiddleware.js";

// Authenticated user routes (owner can create/manage own pets)
router.route("/").post(authenticate, createPet); // Create pet

// Admin routes - list all pets
router.route("/")
  .get(authenticate, authorizeAdmin, getPets);
  
router.route("/mypets").get(authenticate, getUserPets);
// Pet specific routes
router.route("/:id")
  .get(authenticate, getPetById)        // Get pet details
  .put(authenticate, updatePet)         // Update pet (owner or admin)
  .delete(authenticate, deletePet);     // Delete pet (owner or admin)


export default router;
