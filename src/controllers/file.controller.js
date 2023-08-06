// src/controllers/file.controller.js
const fs = require("fs-extra");
const path = require("path");
const multer = require("multer");
const { nanoid } = require("nanoid");
const File = require("../models/file");

// Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Set the destination directory dynamically based on user ID
    const userId = req.user.id;
    const userDir = path.join(
      __dirname,
      "..",
      "..",
      "uploads",
      userId.toString()
    );

    // Ensure that the destination directory exists, create it if not
    fs.ensureDirSync(userDir);

    cb(null, userDir);
  },
  filename: (req, file, cb) => {
    // Use nanoid to generate a unique identifier (6 characters by default) as the file name
    const fileId = nanoid(5);
    const fileName = `${fileId}_${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

// File upload API with versioning
async function uploadFile(req, res) {
  try {
    // Check if the file is being uploaded via the "file" field
    if (!req.file) {
      return res.status(400).json({ error: "No file provided" });
    }

    // Get user ID and file details
    const userId = req.user.id;
    const originalFileName = req.file.originalname;
    const fileName = req.file.filename;
    const filePath = req.file.path;

    // Find the file in the database based on the user ID and original file name
    const existingFile = await File.findOne({
      where: { name: originalFileName, userId },
    });

    if (existingFile) {
      // If the file already exists, create a new version
      const newVersion = existingFile.version + 1;
      const newFileName = `${
        fileName.split("_")[0]
      }_${newVersion}_${originalFileName}`;
      const newFilePath = path.join(path.dirname(filePath), newFileName);

      // Rename the uploaded file to include the version number
      fs.renameSync(filePath, newFilePath);

      // Update the database with the new version details
      await File.create({
        name: originalFileName,
        version: newVersion,
        originalFilePath: newFilePath,
        fileUrl: `/api/file/${userId}/download/${newFileName}`,
        userId,
      });

      return res
        .status(201)
        .json({ message: "File uploaded with a new version" });
    }

    // If the file is being uploaded for the first time, create a new entry in the database
    await File.create({
      name: originalFileName,
      version: 1,
      originalFilePath: filePath,
      fileUrl: `/api/file/${userId}/download/${fileName}`,
      userId,
    });

    res.status(201).json({ message: "File uploaded successfully" });
  } catch (err) {
    console.error("Error uploading file:", err);
    res.status(500).json({ error: "Internal server error" });
  }
}

module.exports = {
  uploadFile,
  upload,
};
