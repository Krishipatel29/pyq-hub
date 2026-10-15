const Question = require("../models/Question");
const User = require("../models/User");
const AppError = require("../utils/AppError");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/questions/search?q=singleton
async function searchQuestions(req, res) {
  const q = (req.query.q || "").trim();
  if (q.length < 2) return res.json({ questions: [] });

  const questions = await Question.find({ isApproved: true, text: new RegExp(escapeRegex(q), "i") })
    .sort({ upvoteCount: -1, year: -1 })
    .limit(30)
    .populate("subject", "name code course semester")
    .select("-keywords -upvotes")
    .lean();

  res.json({ questions });
}

// POST /api/questions/:id/upvote  -> toggle
async function toggleUpvote(req, res) {
  const question = await Question.findById(req.params.id);
  if (!question || !question.isApproved) throw new AppError("Question not found", 404);

  const userId = String(req.user._id);
  const already = question.upvotes.some((u) => String(u) === userId);

  if (already) question.upvotes = question.upvotes.filter((u) => String(u) !== userId);
  else question.upvotes.push(req.user._id);

  question.upvoteCount = question.upvotes.length;
  await question.save();

  res.json({ upvoted: !already, upvoteCount: question.upvoteCount });
}

// POST /api/questions/:id/bookmark  -> toggle
async function toggleBookmark(req, res) {
  const exists = await Question.exists({ _id: req.params.id, isApproved: true });
  if (!exists) throw new AppError("Question not found", 404);

  const user = req.user;
  const id = String(req.params.id);
  const already = user.bookmarks.some((b) => String(b) === id);

  if (already) user.bookmarks = user.bookmarks.filter((b) => String(b) !== id);
  else user.bookmarks.push(req.params.id);

  await user.save();
  res.json({ bookmarked: !already });
}

// GET /api/questions/bookmarks
async function getBookmarks(req, res) {
  const user = await User.findById(req.user._id).populate({
    path: "bookmarks",
    select: "-keywords -upvotes",
    populate: [
      { path: "subject", select: "name code course semester" },
      { path: "paper", select: "year examType month" },
    ],
  });

  // a bookmarked question can be deleted later, so filter out nulls
  res.json({ questions: user.bookmarks.filter(Boolean).reverse() });
}

module.exports = { searchQuestions, toggleUpvote, toggleBookmark, getBookmarks };
