const mongoose = require("mongoose");

const paperSchema = new mongoose.Schema(
  {
    subject: { type: mongoose.Schema.Types.ObjectId, ref: "Subject", required: true },
    year: { type: Number, required: true, min: 2000, max: 2100 },
    month: { type: String, trim: true, default: "" }, // e.g. "Nov"
    examType: { type: String, enum: ["internal", "external", "retest"], required: true },
    fileUrl: { type: String, default: "" },
    fileType: { type: String, default: "" }, // pdf / image
    filePublicId: { type: String, default: "" }, // cloudinary id, used while deleting
    uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    status: { type: String, enum: ["pending", "approved", "rejected"], default: "pending" },
    rejectReason: { type: String, default: "" },
    views: { type: Number, default: 0 },
  },
  { timestamps: true }
);

paperSchema.index({ subject: 1, status: 1, year: -1 });

module.exports = mongoose.model("Paper", paperSchema);
