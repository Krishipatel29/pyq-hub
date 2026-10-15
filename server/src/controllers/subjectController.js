const Subject = require("../models/Subject");
const Paper = require("../models/Paper");
const Question = require("../models/Question");
const AppError = require("../utils/AppError");
const { groupSimilar } = require("../utils/similarity");

const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

// GET /api/subjects?university=&course=&semester=&q=
async function getSubjects(req, res) {
  const { university, course, semester, q } = req.query;
  const filter = {};
  if (university) filter.university = university;
  if (course) filter.course = course;
  if (semester) filter.semester = Number(semester);
  if (q) {
    const rx = new RegExp(escapeRegex(q.trim()), "i");
    filter.$or = [{ name: rx }, { code: rx }];
  }

  const subjects = await Subject.find(filter).sort({ semester: 1, code: 1, name: 1 }).lean();

  // count approved papers for each subject (for the cards on home page)
  const papers = await Paper.find({ status: "approved", subject: { $in: subjects.map((s) => s._id) } })
    .select("subject year")
    .lean();

  const stats = {};
  for (const p of papers) {
    const key = String(p.subject);
    stats[key] = stats[key] || { paperCount: 0, years: new Set() };
    stats[key].paperCount++;
    stats[key].years.add(p.year);
  }

  res.json({
    subjects: subjects.map((s) => {
      const st = stats[String(s._id)];
      const years = st ? [...st.years].sort((a, b) => a - b) : [];
      return {
        ...s,
        paperCount: st?.paperCount || 0,
        yearRange: !years.length ? "" : years.length === 1 ? String(years[0]) : `${years[0]}–${years[years.length - 1]}`,
      };
    }),
  });
}

// GET /api/subjects/filters -> values for the dropdowns
async function getFilters(req, res) {
  const [universities, courses, semesters] = await Promise.all([
    Subject.distinct("university"),
    Subject.distinct("course"),
    Subject.distinct("semester"),
  ]);
  res.json({ universities, courses, semesters: semesters.sort((a, b) => a - b) });
}

// GET /api/subjects/:id
async function getSubject(req, res) {
  const subject = await Subject.findById(req.params.id).lean();
  if (!subject) throw new AppError("Subject not found", 404);

  const papers = await Paper.find({ subject: subject._id, status: "approved" })
    .sort({ year: -1, createdAt: -1 })
    .populate("uploadedBy", "name")
    .lean();

  const counts = await Question.find({ paper: { $in: papers.map((p) => p._id) } })
    .select("paper")
    .lean();
  const qCount = {};
  counts.forEach((q) => (qCount[q.paper] = (qCount[q.paper] || 0) + 1));

  res.json({
    subject,
    papers: papers.map((p) => ({ ...p, questionCount: qCount[p._id] || 0 })),
  });
}

// GET /api/subjects/:id/important
// Groups similar questions from all approved papers of this subject
// and returns the ones that came in 2 or more different years.
async function getImportantQuestions(req, res) {
  const subject = await Subject.findById(req.params.id).lean();
  if (!subject) throw new AppError("Subject not found", 404);

  const minYears = Math.max(1, Number(req.query.minYears) || 2);

  const questions = await Question.find({ subject: subject._id, isApproved: true })
    .populate("paper", "year examType month")
    .sort({ year: 1 })
    .lean();

  const groups = groupSimilar(questions).map((g) => {
    const years = [...new Set(g.items.map((q) => q.year))].sort((a, b) => a - b);
    // show the most upvoted wording as the main question
    const main = [...g.items].sort((a, b) => b.upvoteCount - a.upvoteCount)[0];
    return {
      _id: main._id,
      text: main.text,
      topic: g.items.find((q) => q.topic)?.topic || "",
      marks: Math.max(...g.items.map((q) => q.marks || 0)),
      years,
      timesAsked: g.items.length,
      upvoteCount: g.items.reduce((sum, q) => sum + q.upvoteCount, 0),
      variants: g.items.map((q) => ({
        _id: q._id,
        text: q.text,
        year: q.year,
        examType: q.paper?.examType,
        paperId: q.paper?._id,
      })),
    };
  });

  const important = groups
    .filter((g) => g.years.length >= minYears)
    .sort((a, b) => b.years.length - a.years.length || b.timesAsked - a.timesAsked || b.upvoteCount - a.upvoteCount);

  res.json({ subject, totalQuestions: questions.length, important });
}

// POST /api/subjects (admin)
async function createSubject(req, res) {
  const { university, course, semester, name, code } = req.body;
  const subject = await Subject.create({ university, course, semester, name, code });
  res.status(201).json({ subject });
}

// DELETE /api/subjects/:id (admin) - only if no papers are linked
async function deleteSubject(req, res) {
  const used = await Paper.exists({ subject: req.params.id });
  if (used) throw new AppError("This subject has papers, delete them first");
  await Subject.findByIdAndDelete(req.params.id);
  res.json({ message: "Subject deleted" });
}

module.exports = { getSubjects, getFilters, getSubject, getImportantQuestions, createSubject, deleteSubject };
