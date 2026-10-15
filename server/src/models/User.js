const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 60 },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Invalid email"],
    },
    // select: false -> password never comes back in normal queries
    password: { type: String, required: true, minlength: 6, select: false },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    college: { type: String, trim: true, default: "" },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Question" }],
  },
  { timestamps: true }
);

// hash password only when it is new or changed
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = function (plain) {
  return bcrypt.compare(plain, this.password);
};

module.exports = mongoose.model("User", userSchema);
