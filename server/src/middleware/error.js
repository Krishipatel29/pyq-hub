function notFound(req, res) {
  res.status(404).json({ message: `Route not found: ${req.originalUrl}` });
}

// Express 5 sends errors from async handlers here automatically
// eslint-disable-next-line no-unused-vars
function errorHandler(err, req, res, next) {
  let status = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (err.name === "ValidationError") {
    status = 400;
    message = Object.values(err.errors).map((e) => e.message).join(", ");
  } else if (err.name === "CastError") {
    status = 400;
    message = "Invalid id";
  } else if (err.code === 11000) {
    status = 409;
    message = `${Object.keys(err.keyValue || {}).join(", ") || "Value"} already exists`;
  } else if (err.code === "LIMIT_FILE_SIZE") {
    status = 400;
    message = "File too large (max 10 MB)";
  }

  if (status === 500) console.error(err);
  res.status(status).json({ message });
}

module.exports = { notFound, errorHandler };
