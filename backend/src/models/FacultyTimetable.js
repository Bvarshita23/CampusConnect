import mongoose from "mongoose";

const facultyTimetableSchema = new mongoose.Schema({
  faculty: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timetable: { type: Array, default: [] },
});

export default mongoose.model("FacultyTimetable", facultyTimetableSchema);
