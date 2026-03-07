import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load .env file
dotenv.config();

// Debug logs
console.log("Cloudinary ENV check:", {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY ? "OK" : "MISSING",
  api_secret: process.env.CLOUDINARY_API_SECRET ? "OK" : "MISSING",
});

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export default cloudinary;