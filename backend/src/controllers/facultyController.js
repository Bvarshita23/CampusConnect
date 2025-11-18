// backend/src/controllers/facultyController.js
import FacultyStatus from "../models/FacultyStatus.js";
import User from "../models/User.js";
import asyncHandler from "../utils/asyncHandler.js";

/* ---------------------------------------------------------
    1️⃣  Faculty Updates Their Own Status
--------------------------------------------------------- */
export const updateFacultyStatus = asyncHandler(async (req, res) => {
  const { status, message, location } = req.body;
  const facultyId = req.user._id;

  // ✅ Only two statuses now
  const validStatuses = ["Available", "Not Available"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Invalid status. Choose: ${validStatuses.join(", ")}`,
    });
  }

  if (req.user.role !== "faculty") {
    return res.status(403).json({
      success: false,
      message: "Only faculty members can update their status",
    });
  }

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

  await facultyStatus.populate(
    "faculty",
    "name email department photo experienceYears subjects achievements"
  );

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

/* ---------------------------------------------------------
    2️⃣  Faculty Gets Their Own Current Status
--------------------------------------------------------- */
export const getMyStatus = asyncHandler(async (req, res) => {
  const facultyId = req.user._id;

  if (req.user.role !== "faculty") {
    return res.status(403).json({
      success: false,
      message: "You are not a faculty member",
    });
  }

  let facultyStatus = await FacultyStatus.findOne({
    faculty: facultyId,
  }).populate(
    "faculty",
    "name email department photo experienceYears subjects achievements"
  );

  // ✅ Default to "Not Available"
  if (!facultyStatus) {
    facultyStatus = await FacultyStatus.create({
      faculty: facultyId,
      status: "Not Available",
      updatedBy: facultyId,
    });

    await facultyStatus.populate(
      "faculty",
      "name email department photo experienceYears subjects achievements"
    );
  }

  res.json({
    success: true,
    status: facultyStatus,
  });
});

/* ---------------------------------------------------------
    3️⃣  Admin / Students View ALL Faculty Statuses
--------------------------------------------------------- */
export const getAllFacultyStatuses = asyncHandler(async (req, res) => {
  const { department, status, search } = req.query;

  // Get all faculty users (optionally filtered by department)
  const facultyQuery = { role: "faculty" };
  if (department) facultyQuery.department = department;

  const allFaculty = await User.find(facultyQuery).select(
    "name email department photo experienceYears subjects achievements"
  );

  // Get all status records (optionally filtered by status)
  const statusQuery = {};
  if (status) statusQuery.status = status;

  const existingStatuses = await FacultyStatus.find(statusQuery)
    .populate(
      "faculty",
      "name email department photo experienceYears subjects achievements"
    )
    .sort({ updatedAt: -1 });

  const statusMap = new Map();
  existingStatuses.forEach((s) => {
    if (s.faculty && s.faculty._id) {
      statusMap.set(s.faculty._id.toString(), s);
    }
  });

  // Combine faculty list + status list
  let statuses = allFaculty.map((faculty) => {
    const facultyId = faculty._id.toString();

    if (statusMap.has(facultyId)) {
      return statusMap.get(facultyId);
    }

    // ✅ default status is "Not Available"
    return {
      faculty: faculty,
      status: "Not Available",
      message: "",
      location: "",
      officeHours: [],
      updatedAt: new Date(),
      createdAt: new Date(),
    };
  });

  // Filter again by status if provided
  if (status) {
    statuses = statuses.filter((s) => s.status === status);
  }

  // Filter by search term (name)
  if (search) {
    const term = search.toLowerCase();
    statuses = statuses.filter(
      (s) => s.faculty && s.faculty.name.toLowerCase().includes(term)
    );
  }

  // ✅ Simple sort: Available first, then Not Available, then name
  const statusOrder = {
    Available: 1,
    "Not Available": 2,
  };

  statuses.sort((a, b) => {
    const aOrder = statusOrder[a.status] || 2;
    const bOrder = statusOrder[b.status] || 2;

    if (aOrder !== bOrder) return aOrder - bOrder;

    return (a.faculty?.name || "").localeCompare(b.faculty?.name || "");
  });

  res.json({
    success: true,
    statuses,
    count: statuses.length,
  });
});

/* ---------------------------------------------------------
    4️⃣  Placeholder for future camera automation
--------------------------------------------------------- */
export const autoDetectStatus = asyncHandler(async (req, res) => {
  return res.json({
    success: true,
    message: "Camera-based auto-detection not implemented yet.",
  });
});

/* Get faculty status */
export const getFacultyStatus = async (req, res) => {
  try {
    const faculty = await User.findById(req.user.id);
    if (!faculty || faculty.role !== "faculty") {
      return res
        .status(404)
        .json({ success: false, message: "Faculty not found" });
    }

    res.json({
      success: true,
      status: faculty.status || "unavailable",
      availableFrom: faculty.availableFrom,
      availableUntil: faculty.availableUntil,
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};
