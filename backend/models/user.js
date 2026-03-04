// models/User.js
import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String, required: true },
  password: { type: String, required: true },
  profilePicture: { type: String }, // optional
  role: { type: String, enum: ["Admin", "Doctor", "PetOwner"], required: true },

  // References to role-specific profiles
  doctorProfile: { type: mongoose.Schema.Types.ObjectId, ref: "DoctorProfile" },
  petOwnerProfile: { type: mongoose.Schema.Types.ObjectId, ref: "PetOwnerProfile" },

  // ✅ Email verification fields
  isVerified: { type: Boolean, default: false }, // whether user has verified email
  verificationToken: { type: String },           // random token sent via email
  verificationTokenExpiry: { type: Date },       // expiry time for token

}, { timestamps: true });

export default mongoose.models.User || mongoose.model("User", userSchema);