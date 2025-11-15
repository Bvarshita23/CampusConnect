import FacultyStatus from "../models/FacultyStatus.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

/**
 * ✅ Update faculty status (for faculty members)
 */
export const updateFacultyStatus = asyncHandler(async (req, res) => {
  const { status, message, location } = req.body;
  const facultyId = req.user._id;

  // Validate status
  const validStatuses = ["Available", "In Class", "Busy", "On Leave", "Offline"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Must be one of: ${validStatuses.join(", ")}`,
    });
  }

  // Check if user is faculty
  if (req.user.role !== "faculty") {
    return res.status(403).json({
      success: false,
      message: "Only faculty members can update their status",
    });
  }

  // Find or create faculty status record
  let facultyStatus = await FacultyStatus.findOne({ faculty: facultyId });
  
  if (!facultyStatus) {
    facultyStatus = await FacultyStatus.create({
      faculty: facultyId,
      status,
      message: message || "",
      location: location || "",
      updatedBy: facultyId,
    });
  } else {
    facultyStatus.status = status;
    if (message !== undefined) facultyStatus.message = message;
    if (location !== undefined) facultyStatus.location = location;
    facultyStatus.updatedBy = facultyId;
    await facultyStatus.save();
  }

  // Populate faculty info for response
  await facultyStatus.populate("faculty", "name email department photo");

  // ✅ Emit Socket.io event for real-time updates
  const io = req.app.get("io");
  if (io) {
    io.to("faculty-status").emit("faculty-status-updated", {
      facultyId: facultyId.toString(),
      status: facultyStatus,
    });
  }

  res.json({
    success: true,
    message: "Status updated successfully",
    status: facultyStatus,
  });
});

/**
 * ✅ Get current faculty status (for faculty members)
 */
export const getMyStatus = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;

  if (req.user.role !== "faculty") {
    return res.status(403).json({
      success: false,
      message: "Only faculty members can access their status",
    });
  }

  let facultyStatus = await FacultyStatus.findOne({ faculty: facultyId })
    .populate("faculty", "name email department photo");

  // If no status exists, create default one
  if (!facultyStatus) {
    facultyStatus = await FacultyStatus.create({
      faculty: facultyId,
      status: "Offline",
      updatedBy: facultyId,
    });
    await facultyStatus.populate("faculty", "name email department photo");
  }

  res.json({
    success: true,
    status: facultyStatus,
  });
});

/**
 * ✅ Get all faculty statuses (for students/admin)
 */
export const getAllFacultyStatuses = asyncHandler(async (req, res) => {
  const { department, status, search } = req.query;

  // Get all faculty users
  const facultyQuery = { role: "faculty" };
  if (department) {
    facultyQuery.department = department;
  }

  const allFaculty = await User.find(facultyQuery).select("name email department photo");

  // Get all existing status records
  const statusQuery = {};
  if (status) {
    statusQuery.status = status;
  }

  const existingStatuses = await FacultyStatus.find(statusQuery)
    .populate("faculty", "name email department photo")
    .sort({ updatedAt: -1 });

  // Create a map of faculty ID to status
  const statusMap = new Map();
  existingStatuses.forEach((s) => {
    if (s.faculty && s.faculty._id) {
      statusMap.set(s.faculty._id.toString(), s);
    }
  });

  // Combine: for each faculty, use existing status or create default
  let statuses = allFaculty.map((faculty) => {
    const facultyId = faculty._id.toString();
    if (statusMap.has(facultyId)) {
      return statusMap.get(facultyId);
    } else {
      // Create a default status object for faculty without status record
      return {
        faculty: faculty,
        status: "Offline",
        message: "",
        location: "",
        officeHours: [],
        updatedAt: new Date(),
        createdAt: new Date(),
      };
    }
  });

  // Filter by status if provided (after creating defaults)
  if (status) {
    statuses = statuses.filter((s) => s.status === status);
  }

  // Filter by search term if provided
  if (search) {
    const searchLower = search.toLowerCase();
    statuses = statuses.filter(
      (s) =>
        s.faculty &&
        (s.faculty.name.toLowerCase().includes(searchLower) ||
          (s.faculty.email && s.faculty.email.toLowerCase().includes(searchLower)))
    );
  }

  // Sort by status (Available first) then by name
  statuses.sort((a, b) => {
    const statusOrder = { Available: 1, "In Class": 2, Busy: 3, "On Leave": 4, Offline: 5 };
    const aOrder = statusOrder[a.status] || 5;
    const bOrder = statusOrder[b.status] || 5;
    if (aOrder !== bOrder) return aOrder - bOrder;
    return (a.faculty?.name || "").localeCompare(b.faculty?.name || "");
  });

  res.json({
    success: true,
    statuses,
    count: statuses.length,
  });
});
