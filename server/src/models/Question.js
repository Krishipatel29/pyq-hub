const mongoose = require("mongoose");
const { normalize } = require("../utils/similarity");

const questionSchema = new mongoose.Schema(
  {
    paper: { type: mongoose.Schema.Types.ObjectId, ref: "Paper", required: true },
    // copied from paper so we don't need a join for subject-wise queries
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    year: { type: Number, required: true },
    text: { type: String, required: true, trim: true, maxlength: 1000 },
    marks: { type: Number, default: 0 },
    topic: { type: String, trim: true, default: "" },
    // cleaned keywords, used for finding repeated questions
    keywords: [String],
    upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    upvoteCount: { type: Number, default: 0 },
    isApproved: { type: Boolean, default: false }, // mirrors paper status
  },
  { timestamps: true }
);

questionSchema.pre("save", function () {
  if (this.isModified("text")) this.keywords = normalize(this.text);
});

questionSchema.index({ subject: 1, isApproved: 1 });
questionSchema.index({ paper: 1 });

module.exports = mongoose.model("Question", questionSchema);
