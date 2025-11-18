import xlsx from "xlsx";
import FacultyTimetable from "../models/FacultyTimetable.js";

export const uploadTimetable = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No file uploaded" });

    const workbook = xlsx.readFile(req.file.path);
    const sheet = workbook.Sheets[workbook.SheetNames[0]];
    const rows = xlsx.utils.sheet_to_json(sheet);

    await FacultyTimetable.findOneAndUpdate(
      { faculty: req.user.id },
      { timetable: rows },
      { upsert: true }
    );

    res.json({ success: true, message: "Timetable uploaded", rows });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
