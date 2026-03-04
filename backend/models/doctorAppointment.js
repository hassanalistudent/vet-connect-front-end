import mongoose from "mongoose";

const doctorAppointmentSchema = new mongoose.Schema({
  doctorId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  petId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Pet", 
    required: true 
  },
  ownerId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User", 
    required: true 
  },
  appointmentDate: { 
    type: Date, 
    required: true 
  },
  appointmentTime: { 
    type: String, 
    required: true,
    match: /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, // ✅ HH:mm format
  },
  status: {
    type: String,
    enum: ["Scheduled","Rescheduled", "Completed","Accepted", "Cancelled"],
    default: "Scheduled",
  },

  // ✅ Medical fields
  diagnosis: { type: String },
  treatment: { type: String },
  prescriptions: { type: String },

  // ✅ Business fields
  charges: { 
    type: Number, 
    required: true, 
    min: 0 
  },
  isPaid: { 
    type: Boolean, 
    default: false 
  },

  // ✅ Appointment type
  appointmentType: {
    type: String,
    enum: ["Home Visit", "Video Call", "On Clinic"],
    required: true
  },
}, { timestamps: true });

export default mongoose.model("DoctorAppointment", doctorAppointmentSchema);