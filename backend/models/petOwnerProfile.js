// models/PetOwnerProfile.js
import mongoose from "mongoose";

const petOwnerProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  address: {
    city: { type: String, required: true },       // e.g., Lahore
    district: { type: String, required: true },   // formal area name, e.g., Gulberg, DHA
    street: { type: String, required: true },     // street or house number
  },
}, { timestamps: true });

export default mongoose.model("PetOwnerProfile", petOwnerProfileSchema);