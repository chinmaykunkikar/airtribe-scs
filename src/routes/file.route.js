// src/routes/file.route.js
const express = require("express");
const router = express.Router();
const { uploadFile, upload } = require("../controllers/file.controller");
const authMiddleware = require("../middlewares/auth.middleware");

// File upload route
router.post(
  "/upload",
  authMiddleware.authenticateUser, // Ensure only authenticated users can upload files
  upload.single("file"), // Use the multer middleware to handle file upload
  uploadFile
);

module.exports = router;
