// Saves uploaded files.
// If Cloudinary keys are in .env -> upload to Cloudinary (needed after deploy).
// Otherwise -> save in server/uploads folder (fine for local development).

const fs = require("fs/promises");
const path = require("path");
const crypto = require("crypto");
const cloudinary = require("cloudinary").v2;

const useCloudinary = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
    process.env.CLOUDINARY_API_KEY &&
    process.env.CLOUDINARY_API_SECRET
);

if (useCloudinary) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });
}

const UPLOAD_DIR = path.join(__dirname, "..", "..", "uploads");

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: "pyq-hub", resource_type: "auto" },
      (err, result) => (err ? reject(err) : resolve(result))
    );
    stream.end(file.buffer);
  });
}

async function saveFile(file) {
  const fileType = file.mimetype === "application/pdf" ? "pdf" : "image";

  if (useCloudinary) {
    const result = await uploadToCloudinary(file);
    return { url: result.secure_url, publicId: result.public_id, fileType };
  }

  const ext = path.extname(file.originalname).toLowerCase() || (fileType === "pdf" ? ".pdf" : ".png");
  const name = `${Date.now()}-${crypto.randomBytes(6).toString("hex")}${ext}`;
  await fs.mkdir(UPLOAD_DIR, { recursive: true });
  await fs.writeFile(path.join(UPLOAD_DIR, name), file.buffer);

  const base = process.env.SERVER_URL || `http://localhost:${process.env.PORT || 5000}`;
  return { url: `${base}/uploads/${name}`, publicId: `local:${name}`, fileType };
}

async function deleteFile(publicId) {
  if (!publicId) return;
  try {
    if (publicId.startsWith("local:")) {
      await fs.unlink(path.join(UPLOAD_DIR, publicId.slice(6)));
    } else if (useCloudinary) {
      await cloudinary.uploader.destroy(publicId);
    }
  } catch (err) {
    console.warn("Could not delete file:", err.message);
  }
}

module.exports = { saveFile, deleteFile, UPLOAD_DIR };
