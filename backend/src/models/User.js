// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = [
  "superadmin",
  "department_admin",
  "functional_admin",
  "faculty",
  "student",
  "admin",
];

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    password: {
      type: String,
      required: true,
      minlength: 6,
    },

    role: {
      type: String,
      enum: ROLES,
      default: "student",
    },

    // 🎓 Common fields
    department: { type: String, trim: true }, // CSE, AIML, etc.
    year: { type: Number }, // for students
    usn: { type: String, trim: true, unique: false }, // we handle duplicates in code

    // ⭐ Faculty extras
    experienceYears: { type: Number, default: 0 }, // years of experience
    subjects: { type: String, default: "" }, // "DBMS, OS, ML"
    achievements: { type: String, default: "" }, // text blob

    // 🔐 Reset password (optional)
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },

    // 📷 File path served via Express static
    photo: { type: String, default: null },

    // 📅 Faculty availability
    status: {
      type: String,
      enum: ["available", "unavailable", "busy"],
      default: "unavailable",
    },
    availableFrom: String,
    availableUntil: String,
    lastStatusUpdate: Date,
  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

export default mongoose.model("User", userSchema);
