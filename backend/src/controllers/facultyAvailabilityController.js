import FacultyAvailability from "../models/FacultyAvailability.js";
import User from "../models/User.js";

/**
 * 🟢 AUTO: Mark faculty available after login
 * Called from login route OR faculty dashboard page when loaded
 */
export const autoSetAvailable = async (req, res) => {
  try {
    const facultyId = req.user._id;

    if (req.user.role !== "faculty") {
      return res.json({ success: true, message: "Not faculty, skipping" });
    }

    let record = await FacultyAvailability.findOne({ faculty: facultyId });

    if (!record) {
      record = await FacultyAvailability.create({
        faculty: facultyId,
        isAvailable: true,
        manualOverride: false,
        lastUpdated: Date.now(),
      });
    } else {
      record.isAvailable = true;
      record.manualOverride = false;
      record.lastUpdated = Date.now();
      await record.save();
    }

    return res.json({ success: true, message: "Auto available updated" });
  } catch (err) {
    console.error("autoSetAvailable error:", err);
    res.status(500).json({ success: false, message: "Failed" });
  }
};

/**
 * 🟡 MANUAL UPDATE (faculty clicks toggle)
 */
export const updateAvailability = async (req, res) => {
  try {
    const { isAvailable } = req.body;
    const facultyId = req.user._id;

    let record = await FacultyAvailability.findOne({ faculty: facultyId });
    if (!record) {
      record = await FacultyAvailability.create({ faculty: facultyId });
    }

    record.isAvailable = isAvailable;
    record.manualOverride = true;
    record.lastUpdated = Date.now();
    await record.save();

    res.json({ success: true, message: "Availability updated", record });
  } catch (err) {
    console.error("updateAvailability error:", err);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

/**
 * 🟣 VIEW ALL – role-based filtering
 */
export const getAllAvailability = async (req, res) => {
  try {
    const role = req.user.role;
    const department = req.user.department;

    let filter = {};

    // Department admin sees only their department
    if (role === "department_admin") {
      filter = { "faculty.department": department };
    }

    // Faculty — show only themselves
    if (role === "faculty") {
      filter = { faculty: req.user._id };
    }

    // Students / Functional Admin / SuperAdmin see everything
    // Except department admin (already filtered)

    const data = await FacultyAvailability.find()
      .populate("faculty", "name email department role")
      .sort({ "faculty.name": 1 });

    let filtered = data;

    // Apply department admin filter
    if (role === "department_admin") {
      filtered = data.filter(
        (f) => f.faculty?.department === req.user.department
      );
    }

    res.json({ success: true, availability: filtered });
  } catch (err) {
    console.error("getAllAvailability error:", err);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};
