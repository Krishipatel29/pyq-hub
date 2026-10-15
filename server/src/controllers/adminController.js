const Paper = require("../models/Paper");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const User = require("../models/User");
const AppError = require("../utils/AppError");

// GET /api/admin/papers?status=pending
async function getPapersByStatus(req, res) {
  const status = req.query.status || "pending";
  if (!["pending", "approved", "rejected"].includes(status)) throw new AppError("Invalid status");

  const papers = await Paper.find({ status })
    .sort({ createdAt: status === "pending" ? 1 : -1 }) // oldest pending first
    .limit(100)
    .populate("subject", "name code course semester university")
    .populate("uploadedBy", "name email")
    .lean();

  const counts = await Question.find({ paper: { $in: papers.map((p) => p._id) } }).select("paper").lean();
  const qCount = {};
  counts.forEach((q) => (qCount[q.paper] = (qCount[q.paper] || 0) + 1));

  res.json({ papers: papers.map((p) => ({ ...p, questionCount: qCount[p._id] || 0 })) });
}

// PATCH /api/admin/papers/:id/status  { status, rejectReason }
async function updatePaperStatus(req, res) {
  const { status, rejectReason = "" } = req.body;
  if (!["approved", "rejected"].includes(status)) throw new AppError("Status must be approved or rejected");
  if (status === "rejected" && !rejectReason.trim()) throw new AppError("Please give a reason for rejecting");

  const paper = await Paper.findById(req.params.id);
  if (!paper) throw new AppError("Paper not found", 404);

  paper.status = status;
  paper.rejectReason = status === "rejected" ? rejectReason.trim() : "";
  await paper.save();

  // questions become public only with the paper
  await Question.updateMany({ paper: paper._id }, { isApproved: status === "approved" });

  res.json({ paper });
}

// GET /api/admin/stats
async function getAdminStats(req, res) {
  const [users, subjects, pending, approved, rejected, questions] = await Promise.all([
    User.countDocuments(),
    Subject.countDocuments(),
    Paper.countDocuments({ status: "pending" }),
    Paper.countDocuments({ status: "approved" }),
    Paper.countDocuments({ status: "rejected" }),
    Question.countDocuments({ isApproved: true }),
  ]);
  res.json({ users, subjects, pending, approved, rejected, questions });
}

module.exports = { getPapersByStatus, updatePaperStatus, getAdminStats };
