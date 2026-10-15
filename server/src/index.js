require("dotenv").config({ quiet: true });

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const cookieParser = require("cookie-parser");

const connectDB = require("./config/db");
const { UPLOAD_DIR } = require("./config/storage");
const { notFound, errorHandler } = require("./middleware/error");
const Paper = require("./models/Paper");
const Question = require("./models/Question");
const Subject = require("./models/Subject");
const User = require("./models/User");

if (!process.env.JWT_SECRET) {
  console.error("JWT_SECRET is missing in .env");
  process.exit(1);
}

const app = express();
const PORT = process.env.PORT || 5000;
const CLIENT_URL = process.env.CLIENT_URL || "http://localhost:5173";

// needed on Render/Railway so secure cookies work behind their proxy
app.set("trust proxy", 1);

app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));
app.use(cors({ origin: CLIENT_URL.split(","), credentials: true }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());
if (process.env.NODE_ENV !== "production") app.use(morgan("dev"));

app.use("/uploads", express.static(UPLOAD_DIR));

app.get("/api/health", (req, res) => res.json({ ok: true }));

// numbers shown on the home page
app.get("/api/stats", async (req, res) => {
  const [papers, questions, subjects, users] = await Promise.all([
    Paper.countDocuments({ status: "approved" }),
    Question.countDocuments({ isApproved: true }),
    Subject.countDocuments(),
    User.countDocuments(),
  ]);
  res.json({ papers, questions, subjects, users });
});

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/subjects", require("./routes/subjectRoutes"));
app.use("/api/papers", require("./routes/paperRoutes"));
app.use("/api/questions", require("./routes/questionRoutes"));
app.use("/api/admin", require("./routes/adminRoutes"));

app.use(notFound);
app.use(errorHandler);

connectDB().then(() => {
  app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
});
