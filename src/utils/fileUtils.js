const fs = require("fs");
const path = require("path");

const saveFileToDisk = async (
  filePath,
  userId,
  originalname,
  versionNumber
) => {
  try {
    // Create a unique directory for the user (if it doesn't exist)
    const userDir = path.join(__dirname, `../uploads/${userId}`);
    if (!fs.existsSync(userDir)) {
      fs.mkdirSync(userDir, { recursive: true });
    }

    // Check if the file version directory exists
    const versionDir = path.join(userDir, originalname);
    if (!fs.existsSync(versionDir)) {
      fs.mkdirSync(versionDir);
    }

    // Generate the new file name with the version number
    const newFileName = `${originalname}_v${versionNumber}`;
    const newPath = path.join(versionDir, newFileName);

    // Move the file to the new path with the version number
    fs.renameSync(filePath, newPath);

    return newPath;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  saveFileToDisk,
};
