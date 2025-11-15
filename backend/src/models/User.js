// backend/src/models/User.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const ROLES = [
  "superadmin", // full power
  "department_admin", // manages users in a department (CSE, AIML, etc.)
  "functional_admin", // manages problem categories (Water, Electricity, etc.)
  "faculty",
  "student",
  "admin", // (legacy) keep to avoid breaking old code
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
    password: { type: String, required: true },
    role: { type: String, enum: ROLES, default: "student", index: true },

    // For students & faculty
    department: { type: String, trim: true }, // e.g., CSE, AIML, ECE OR functional category for functional_admin
    year: { type: String, trim: true }, // students only
    usn: { type: String, unique: true, sparse: true, trim: true }, // unique but optional

    // For faculty only
    designation: { type: String, trim: true }, // e.g., Professor, Assistant Professor, etc.
    experience: { type: String, trim: true }, // e.g., "32 years", "11.5 years", etc.

    // File path served by /uploads
    photo: { type: String, default: null },
    resetPasswordToken: { type: String },
    resetPasswordExpire: { type: Date },
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
