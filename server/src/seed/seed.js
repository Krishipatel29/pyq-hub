// Fills the database with demo data.
// Run:  npm run seed      (this DELETES existing data first)

require("dotenv").config({ quiet: true });
const mongoose = require("mongoose");
const User = require("../models/User");
const Subject = require("../models/Subject");
const Paper = require("../models/Paper");
const Question = require("../models/Question");
const data = require("./data");

async function seed() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log("Connected, clearing old data...");

  await Promise.all([User.deleteMany(), Subject.deleteMany(), Paper.deleteMany(), Question.deleteMany()]);

  const admin = await User.create(data.users.admin);
  const student = await User.create(data.users.student);
  console.log("Users created");

  const subjects = {};
  for (const s of data.subjects) {
    const doc = await Subject.create(s);
    subjects[s.name] = doc;
  }
  console.log(`${data.subjects.length} subjects created`);

  let paperCount = 0;
  let questionCount = 0;

  for (const p of data.papers) {
    const subject = subjects[p.subject];
    const status = p.status || "approved";
    const paper = await Paper.create({
      subject: subject._id,
      year: p.year,
      month: p.month || "",
      examType: p.examType,
      uploadedBy: status === "approved" && !p.byStudent ? admin._id : student._id,
      status,
      rejectReason: p.rejectReason || "",
      views: Math.floor(Math.random() * 120) + 10,
    });

    const docs = await Question.create(
      p.questions.map(([text, marks, topic]) => ({
        text,
        marks,
        topic,
        paper: paper._id,
        subject: subject._id,
        year: p.year,
        isApproved: status === "approved",
      }))
    );

    paperCount++;
    questionCount += docs.length;
  }

  // a few upvotes and bookmarks so the demo doesn't look empty
  const some = await Question.find({ isApproved: true }).limit(60);
  for (const q of some) {
    if (Math.random() < 0.5) {
      q.upvotes.push(student._id);
      q.upvoteCount = q.upvotes.length;
      await q.save();
    }
  }
  student.bookmarks = some.slice(0, 4).map((q) => q._id);
  await student.save();

  console.log(`${paperCount} papers and ${questionCount} questions created`);
  console.log("\nLogin details:");
  console.log(`  Admin   -> ${data.users.admin.email} / ${data.users.admin.password}`);
  console.log(`  Student -> ${data.users.student.email} / ${data.users.student.password}`);

  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
