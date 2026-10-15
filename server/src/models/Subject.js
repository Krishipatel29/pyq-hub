const mongoose = require("mongoose");

const subjectSchema = new mongoose.Schema(
  {
    university: { type: String, required: true, trim: true },
    course: { type: String, required: true, trim: true },
    semester: { type: Number, required: true, min: 1, max: 10 },
    name: { type: String, required: true, trim: true },
    code: { type: String, trim: true, default: "" },
  },
  { timestamps: true }
);

// same subject should not be added twice for one course + sem
subjectSchema.index({ university: 1, course: 1, semester: 1, name: 1 }, { unique: true });

module.exports = mongoose.model("Subject", subjectSchema);
