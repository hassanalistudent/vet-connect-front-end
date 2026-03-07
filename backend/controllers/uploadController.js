import streamifier from "streamifier";
import cloudinary from "../config/cloudinary.js";

// Common upload handler
const handleUpload = (fileBuffer, folder, res, successMessage) => {
  const uploadStream = cloudinary.uploader.upload_stream(
    { folder },
    (error, result) => {
      if (error) {
        return res.status(500).send({ message: error.message });
      }
      res.status(200).send({
        message: successMessage,
        public_id: result.public_id,   // store in MongoDB
        secure_url: result.secure_url, // optional, for direct display
      });
    }
  );
  streamifier.createReadStream(fileBuffer).pipe(uploadStream);
};

// Controller for user profile image
export const uploadUserProfileImage = (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No image file provided" });
  }
  handleUpload(
    req.file.buffer,
    "vetconnect/user_profiles",
    res,
    "User profile image uploaded successfully"
  );
};

// Controller for pet profile image
export const uploadPetProfileImage = (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No image file provided" });
  }
  handleUpload(
    req.file.buffer,
    "vetconnect/pet_profiles",
    res,
    "Pet profile image uploaded successfully"
  );
};

// Controller for document images
export const uploadDocumentImage = (req, res) => {
  if (!req.file) {
    return res.status(400).send({ message: "No document image file provided" });
  }
  handleUpload(
    req.file.buffer,
    "vetconnect/documents",
    res,
    "Document image uploaded successfully"
  );
};