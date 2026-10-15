const multer = require("multer");
const AppError = require("../utils/AppError");

const ALLOWED = ["application/pdf", "image/jpeg", "image/png", "image/webp"];

// keep file in memory, then we decide where to save it (cloudinary or disk)
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (ALLOWED.includes(file.mimetype)) cb(null, true);
    else cb(new AppError("Only PDF, JPG, PNG or WEBP files are allowed"));
  },
});

module.exports = upload;
