const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

// Reads the JWT from the httpOnly cookie and puts the user on req.user
async function protect(req, res, next) {
  const token = req.cookies?.token;
  if (!token) throw new AppError("Please login first", 401);

  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError("Session expired, please login again", 401);
  }

  const user = await User.findById(payload.id);
  if (!user) throw new AppError("User no longer exists", 401);

  req.user = user;
  next();
}

// Same as protect, but does not block guests (used on public pages)
async function optionalAuth(req, res, next) {
  const token = req.cookies?.token;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = await User.findById(payload.id);
    } catch {
      // invalid token -> treat as guest
    }
  }
  next();
}

function adminOnly(req, res, next) {
  if (req.user?.role !== "admin") throw new AppError("Admin access only", 403);
  next();
}

module.exports = { protect, optionalAuth, adminOnly };
