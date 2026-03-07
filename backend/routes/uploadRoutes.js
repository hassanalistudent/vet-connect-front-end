import express from "express";
import multer from "multer";
import {
  uploadUserProfileImage,
  uploadPetProfileImage,
  uploadDocumentImage,
} from "../controllers/uploadController.js";

const router = express.Router();

// Multer setup
const storage = multer.memoryStorage();
const fileFilter = (req, file, cb) => {
  const filetypes = /jpe?g|png|webp/;
  const mimetypes = /image\/jpe?g|image\/png|image\/webp/;
  const extname = file.originalname.toLowerCase();
  const mimetype = file.mimetype;

  if (filetypes.test(extname) && mimetypes.test(mimetype)) {
    cb(null, true);
  } else {
    cb(new Error("images only"), false);
  }
};

const upload = multer({ storage, fileFilter });
const uploadSingleImage = upload.single("image");

// Routes
router.post("/user", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) return res.status(400).send({ message: err.message });
    uploadUserProfileImage(req, res);
  });
});

router.post("/pet", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) return res.status(400).send({ message: err.message });
    uploadPetProfileImage(req, res);
  });
});

router.post("/document", (req, res) => {
  uploadSingleImage(req, res, (err) => {
    if (err) return res.status(400).send({ message: err.message });
    uploadDocumentImage(req, res);
  });
});

export default router;