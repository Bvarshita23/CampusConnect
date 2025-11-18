// backend/src/controllers/facultyStatusController.js
import FacultyStatus from "../models/FacultyStatus.js";
import User from "../models/User.js";

const MAP = {
  Available: "available",
  Busy: "busy",
  "In Class": "in_class",
  "On Leave": "on_leave",
  Offline: "unavailable",
};

/* --------------------- FACULTY GET OWN STATUS --------------------- */
export const getMyStatus = async (req, res) => {
  try {
    const status = await FacultyStatus.findOne({ faculty: req.user._id });

    if (!status) {
      return res.json({
        success: true,
        status: {
          status: "unavailable",
          message: "",
          location: "",
        },
      });
    }

    res.json({ success: true, status });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* --------------------- FACULTY UPDATE OWN STATUS --------------------- */
export const updateStatus = async (req, res) => {
  try {
    let { status, message, location } = req.body;

    status = MAP[status] || "unavailable";

    const updated = await FacultyStatus.findOneAndUpdate(
      { faculty: req.user._id },
      {
        faculty: req.user._id,
        status,
        message,
        location,
        updatedBy: req.user._id,
      },
      { new: true, upsert: true }
    );

    res.json({ success: true, status: updated });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* --------------------- SUPERADMIN / ADMIN / DEPT ADMIN: ALL STATUSES --------------------- */
export const getAllFacultyStatuses = async (req, res) => {
  try {
    const statuses = await FacultyStatus.find().populate(
      "faculty",
      "name email department photo"
    );

    res.json({ success: true, statuses });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* --------------------- OPTIONAL: basic GET all without role check --------------------- */
export const getAllStatuses = async (req, res) => {
  try {
    // 1️⃣ Fetch ALL faculty users
    const facultyUsers = await User.find({ role: "faculty" }).select(
      "_id name email department photo"
    );

    // 2️⃣ Fetch all existing status docs
    const statuses = await FacultyStatus.find().lean();

    // 3️⃣ Merge results → ensure every faculty appears
    const merged = facultyUsers.map((faculty) => {
      const statusDoc = statuses.find(
        (s) => s.faculty?.toString() === faculty._id.toString()
      );

      return {
        faculty,
        status: statusDoc?.status || "Not Available",
        message: statusDoc?.message || "",
        location: statusDoc?.location || "",
        updatedAt: statusDoc?.updatedAt || null,
      };
    });

    res.json({ success: true, statuses: merged });
  } catch (err) {
    console.error("❌ Error fetching faculty:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
