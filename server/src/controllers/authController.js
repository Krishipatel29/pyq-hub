const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const isProd = process.env.NODE_ENV === "production";

const cookieOptions = {
  httpOnly: true, // JS in browser cannot read it -> safer against XSS
  secure: isProd, // https only in production
  // frontend and backend are on different domains after deploy
  sameSite: isProd ? "none" : "lax",
  maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
};

function sendToken(user, statusCode, res) {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: "7d" });
  res.cookie("token", token, cookieOptions);
  res.status(statusCode).json({ user: publicUser(user) });
}

function publicUser(user) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    role: user.role,
    college: user.college,
    bookmarks: user.bookmarks,
  };
}

// POST /api/auth/register
async function register(req, res) {
  const { name, email, password, college } = req.body;

  if (!name || !email || !password) throw new AppError("Name, email and password are required");
  if (password.length < 6) throw new AppError("Password must be at least 6 characters");

  const exists = await User.findOne({ email: email.toLowerCase() });
  if (exists) throw new AppError("Email is already registered", 409);

  // role is never taken from the request body, so nobody can sign up as admin
  const user = await User.create({ name, email, password, college });
  sendToken(user, 201, res);
}

// POST /api/auth/login
async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password) throw new AppError("Email and password are required");

  const user = await User.findOne({ email: email.toLowerCase() }).select("+password");
  // same message for both cases, so we don't tell which emails exist
  if (!user || !(await user.comparePassword(password))) {
    throw new AppError("Invalid email or password", 401);
  }

  sendToken(user, 200, res);
}

// POST /api/auth/logout
function logout(req, res) {
  res.clearCookie("token", { ...cookieOptions, maxAge: undefined });
  res.json({ message: "Logged out" });
}

// GET /api/auth/me
function me(req, res) {
  res.json({ user: publicUser(req.user) });
}

module.exports = { register, login, logout, me };
