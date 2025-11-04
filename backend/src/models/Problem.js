import mongoose from "mongoose";

const CATEGORY = [
  "Infrastructure",
  "IT",
  "Academic",
  "Hostel",
  "Admin",
  "Other",
];
const STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

const ProblemSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: 3,
      maxlength: 120,
    },
    description: {
      type: String,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 2000,
    },
    category: { type: String, enum: CATEGORY, default: "Other", index: true },
    department: { type: String, required: true, trim: true, index: true }, // e.g., "IT", "CSE", "Electrical", "Facilities"
    status: { type: String, enum: STATUS, default: "OPEN", index: true },

    submittedBy: {
      _id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      name: { type: String, required: true },
      email: { type: String, required: true },
      role: { type: String, required: true }, // "student" | "faculty" | "admin"
    },

    // optional fields for tracking
    assignedTo: {
      _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
      name: String,
      email: String,
      role: String,
    },
    comments: [
      {
        _id: false,
        by: {
          _id: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          name: String,
          role: String,
        },
        text: { type: String, trim: true, maxlength: 1000 },
        at: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
);

export default mongoose.model("Problem", ProblemSchema);
