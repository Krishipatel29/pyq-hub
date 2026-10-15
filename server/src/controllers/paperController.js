const Paper = require("../models/Paper");
const Question = require("../models/Question");
const Subject = require("../models/Subject");
const AppError = require("../utils/AppError");
const { saveFile, deleteFile } = require("../config/storage");

const MAX_QUESTIONS = 60;

function parseQuestions(raw) {
  let list = raw;
  if (typeof raw === "string") {
    try {
      list = JSON.parse(raw);
    } catch {
      throw new AppError("Questions data is not valid");
    }
  }
  if (!Array.isArray(list)) return [];

  return list
    .map((q) => ({
      text: String(q.text || "").trim(),
      marks: Number(q.marks) || 0,
      topic: String(q.topic || "").trim().slice(0, 60),
    }))
    .filter((q) => q.text.length >= 5);
}

// can this user see a paper that is not approved yet?
function canSeePrivate(paper, user) {
  if (!user) return false;
  return user.role === "admin" || String(paper.uploadedBy?._id || paper.uploadedBy) === String(user._id);
}

// GET /api/papers/recent
async function getRecentPapers(req, res) {
  const limit = Math.min(Number(req.query.limit) || 6, 20);
  const papers = await Paper.find({ status: "approved" })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate("subject", "name code course semester university")
    .lean();
  res.json({ papers });
}

// GET /api/papers/:id
async function getPaper(req, res) {
  const paper = await Paper.findById(req.params.id)
    .populate("subject")
    .populate("uploadedBy", "name college")
    .lean();
  if (!paper) throw new AppError("Paper not found", 404);

  if (paper.status !== "approved" && !canSeePrivate(paper, req.user)) {
    throw new AppError("Paper not found", 404);
  }

  const questions = await Question.find({ paper: paper._id }).sort({ createdAt: 1 }).lean();
  const userId = req.user ? String(req.user._id) : null;
  const bookmarks = new Set((req.user?.bookmarks || []).map(String));

  // count a view (not for the uploader)
  if (paper.status === "approved" && userId !== String(paper.uploadedBy?._id)) {
    await Paper.updateOne({ _id: paper._id }, { $inc: { views: 1 } });
  }

  res.json({
    paper,
    questions: questions.map(({ upvotes, keywords, ...q }) => ({
      ...q,
      upvoted: userId ? upvotes.some((u) => String(u) === userId) : false,
      bookmarked: bookmarks.has(String(q._id)),
    })),
  });
}

// POST /api/papers  (multipart/form-data)
async function createPaper(req, res) {
  const { subjectId, year, month = "", examType } = req.body;

  if (!subjectId || !year || !examType) throw new AppError("Subject, year and exam type are required");

  const subject = await Subject.findById(subjectId);
  if (!subject) throw new AppError("Subject not found", 404);

  const questions = parseQuestions(req.body.questions);
  if (!questions.length && !req.file) {
    throw new AppError("Add the paper file or at least one question");
  }
  if (questions.length > MAX_QUESTIONS) throw new AppError(`Maximum ${MAX_QUESTIONS} questions per paper`);

  const duplicate = await Paper.findOne({
    subject: subjectId,
    year: Number(year),
    examType,
    month,
    status: { $in: ["approved", "pending"] },
  });
  if (duplicate) throw new AppError("This paper is already uploaded (or waiting for approval)", 409);

  let file = {};
  if (req.file) file = await saveFile(req.file);

  const isAdmin = req.user.role === "admin";
  const paper = await Paper.create({
    subject: subjectId,
    year: Number(year),
    month,
    examType,
    fileUrl: file.url || "",
    fileType: file.fileType || "",
    filePublicId: file.publicId || "",
    uploadedBy: req.user._id,
    status: isAdmin ? "approved" : "pending",
  });

  // create() runs the pre-save hook, so keywords get filled for every question
  await Question.create(
    questions.map((q) => ({
      ...q,
      paper: paper._id,
      subject: subjectId,
      year: paper.year,
      isApproved: isAdmin,
    }))
  );

  res.status(201).json({
    paper,
    message: isAdmin ? "Paper published" : "Paper submitted! It will be live after admin approval.",
  });
}

// GET /api/papers/mine
async function getMyPapers(req, res) {
  const papers = await Paper.find({ uploadedBy: req.user._id })
    .sort({ createdAt: -1 })
    .populate("subject", "name code course semester")
    .lean();
  res.json({ papers });
}

// DELETE /api/papers/:id (owner while pending, or admin)
async function deletePaper(req, res) {
  const paper = await Paper.findById(req.params.id);
  if (!paper) throw new AppError("Paper not found", 404);

  const isOwner = String(paper.uploadedBy) === String(req.user._id);
  const isAdmin = req.user.role === "admin";
  if (!isAdmin && !(isOwner && paper.status !== "approved")) {
    throw new AppError("You can't delete this paper", 403);
  }

  await Question.deleteMany({ paper: paper._id });
  await deleteFile(paper.filePublicId);
  await paper.deleteOne();
  res.json({ message: "Paper deleted" });
}

module.exports = { getRecentPapers, getPaper, createPaper, getMyPapers, deletePaper };
