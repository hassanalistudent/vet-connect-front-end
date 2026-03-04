// backend/index.js - ✅ CORS FIXED
import dotenv from "dotenv";
dotenv.config();

import path from "path";
import express from "express";
import cors from "cors";  // ✅ ADD THIS IMPORT
import cookieParser from "cookie-parser";
import userRoutes from "./routes/userRoutes.js";
import petRoutes from "./routes/petRoutes.js";
import appointmentRoutes from "./routes/appointmentRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import videoRoutes from "./routes/videoRoutes.js";
import dashboardRoutes from "./routes/dashboardRoutes.js"
import connectDB from "./config/db.js";
import platformReviewRoutes from "./routes/plateformReviewRouter.js"
import customerSupportRoutes from "./routes/customerSupportRouter.js"


const port = process.env.PORT || 5000;

connectDB();
const app = express();

// ✅ CORS - FIXED (Add BEFORE all middleware/routes)
app.use(cors({
  origin: 'http://localhost:5173',  // Your Vite frontend
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Routes
app.use("/api/users", userRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/pets", petRoutes);
app.use("/api/appointments", appointmentRoutes);
app.use("/api/video", videoRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/reviews",platformReviewRoutes);
app.use("/api/customersupport",customerSupportRoutes);

const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname + "/uploads")));

app.listen(port, () => console.log(`Server running on port ${port}`));
