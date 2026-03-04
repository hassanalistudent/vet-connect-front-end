// models/DoctorProfile.js
import mongoose from "mongoose";

const reviewSchema = mongoose.Schema({
  name: { type: String, required: true },
  rating: { type: Number, required: true },
  comment: { type: String, required: true },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "User",
  },
}, { timestamps: true });

const doctorProfileSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  pvmcRegistrationNumber: { type: String, required: true },
  image: { type: String, required: true },
  degreeName: { type: String, default: "DVM" },
  yearsOfExperience: { type: Number },
  specialization: { type: String, enum: ["Cats", "Dogs", "Birds"] },

  servicesOffered: {
    videoConsultation: {
      available: { type: Boolean, default: false },
      charges: { type: Number, default: 0 },
      description: { type: String },
    },
    clinicConsultation: {
      available: { type: Boolean, default: false },
      charges: { type: Number, default: 0 },
      description: { type: String },
    },
    homeVisit: {
      available: { type: Boolean, default: false },
      charges: { type: Number, default: 0 },
      description: { type: String },
    },
  },

  clinicDetails: {
    clinicName: String,
    clinicCity: { type: String, required: true },
    clinicDistrict: { type: String, required: true },
    clinicStreet: { type: String, required: true },
    googleMapLocation: String,
    startTime: String,
    endTime: String,
  },

  homeVisitDetails: {
    areasCovered: [String],
    charges: Number,
  },

  reviews: { type: [reviewSchema], default: [] },
  rating: { type: Number, required: true, default: 0 },
  numReviews: { type: Number, required: true, default: 0 },

  verificationUploads: {
    veterinaryLicense: String,
    status: { type: String, enum: ["Pending", "Approved", "Rejected"], default: "Pending" },
  },

  // ✅ New field for real-time availability
  availableNow: { type: Boolean, default: false },

}, { timestamps: true });

export default mongoose.model("DoctorProfile", doctorProfileSchema);