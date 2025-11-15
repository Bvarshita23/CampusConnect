import mongoose from "mongoose";

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const officeHourSchema = new mongoose.Schema(
  {
    day: { type: String, enum: DAYS, required: true },
    from: { type: String, required: true },
    to: { type: String, required: true },
  },
  { _id: false }
);

const facultyStatusSchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["Available", "In Class", "Busy", "On Leave", "Offline"],
      default: "Offline",
      index: true,
    },
    message: { type: String, trim: true },
    location: { type: String, trim: true },
    nextAvailableAt: { type: Date },
    officeHours: [officeHourSchema],
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

facultyStatusSchema.index({ status: 1, updatedAt: -1 });
facultyStatusSchema.index({ "officeHours.day": 1 });

export default mongoose.model("FacultyStatus", facultyStatusSchema);






