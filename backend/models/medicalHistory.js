import mongoose from "mongoose";

const medicalHistorySchema = new mongoose.Schema({
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pet", 
    required: true 
  },
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  // ✅ Link directly to appointment
  appointmentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "DoctorAppointment", 
    required: true 
  },
  visitDate: { 
    type: Date, 
    default: Date.now 
  },
}, { timestamps: true });

export default mongoose.model("MedicalHistory", medicalHistorySchema);