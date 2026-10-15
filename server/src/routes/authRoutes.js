const router = require("express").Router();
const rateLimit = require("express-rate-limit");
const { register, login, logout, me } = require("../controllers/authController");
const { protect } = require("../middleware/auth");

// max 20 login/register tries in 15 min from one IP
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 20,
  message: { message: "Too many attempts, try again after some time" },
});

router.post("/register", authLimiter, register);
router.post("/login", authLimiter, login);
router.post("/logout", logout);
router.get("/me", protect, me);

module.exports = router;
