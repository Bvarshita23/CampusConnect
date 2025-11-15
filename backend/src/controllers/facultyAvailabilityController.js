import FacultyAvailability from "../models/FacultyAvailability.js";
import FacultyStatus from "../models/FacultyStatus.js";
import User from "../models/User.js";

// Lazy import camera detection service to prevent startup errors
let cameraDetectionService = null;
const getCameraDetectionService = async () => {
  if (!cameraDetectionService) {
    try {
      cameraDetectionService = await import("../services/cameraDetectionService.js");
      return cameraDetectionService;
    } catch (error) {
      console.error("Failed to load camera detection service:", error);
      return null;
    }
  }
  return cameraDetectionService;
};

/**
 * ✅ Faculty manually update their availability
 * When manually updated, it overrides camera detection
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
    record.manualOverride = true; // Set manual override to disable auto-detection
    record.lastUpdated = Date.now();
    await record.save();

    // Also update FacultyStatus
    let facultyStatus = await FacultyStatus.findOne({ faculty: facultyId });
    if (facultyStatus) {
      facultyStatus.status = isAvailable ? "Available" : "Offline";
      await facultyStatus.save();

      // Emit socket event
      const io = req.app.get("io");
      if (io) {
        io.to("faculty-status").emit("faculty-status-updated", {
          facultyId: facultyId.toString(),
          status: facultyStatus,
        });
      }
    }

    res.json({ success: true, message: "Availability updated", record });
  } catch (err) {
    console.error("updateAvailability error:", err);
    res.status(500).json({ success: false, message: "Failed to update" });
  }
};

/**
 * ✅ Upload faculty image (face reference)
 */
export const uploadFacultyImage = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });

    const facultyId = req.user._id;
    const imageUrl = `/uploads/${req.file.filename}`;

    let record = await FacultyAvailability.findOne({ faculty: facultyId });
    if (!record) {
      record = await FacultyAvailability.create({
        faculty: facultyId,
        imageUrl,
      });
    } else {
      record.imageUrl = imageUrl;
      await record.save();
    }

    res.json({ success: true, message: "Image uploaded", imageUrl });
  } catch (err) {
    console.error("uploadFacultyImage error:", err);
    res.status(500).json({ success: false, message: "Image upload failed" });
  }
};

/**
 * 📸 Camera-based availability update: upload image and mark available (not manual override)
 */
export const cameraUpdateAvailability = async (req, res) => {
  try {
    if (!req.file)
      return res
        .status(400)
        .json({ success: false, message: "No image file provided" });

    const facultyId = req.user._id;
    const imageUrl = `/uploads/${req.file.filename}`;

    let record = await FacultyAvailability.findOne({ faculty: facultyId });
    if (!record) {
      record = await FacultyAvailability.create({
        faculty: facultyId,
        imageUrl,
        isAvailable: true,
        manualOverride: false,
        lastUpdated: Date.now(),
      });
    } else {
      record.imageUrl = imageUrl;
      record.isAvailable = true;
      record.manualOverride = false;
      record.lastUpdated = Date.now();
      await record.save();
    }

    res.json({ success: true, message: "Camera availability updated", record });
  } catch (err) {
    console.error("cameraUpdateAvailability error:", err);
    res.status(500).json({ success: false, message: "Camera update failed" });
  }
};

/**
 * ✅ Students view all faculty availability
 */
export const getAllAvailability = async (req, res) => {
  try {
    const data = await FacultyAvailability.find()
      .populate("faculty", "name email department")
      .sort({ "faculty.name": 1 });

    res.json({ success: true, availability: data });
  } catch (err) {
    console.error("getAllAvailability error:", err);
    res.status(500).json({ success: false, message: "Failed to fetch data" });
  }
};

/**
 * 🎥 Start camera-based presence detection
 */
export const startDetection = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const { cameraDeviceId = 0, detectionTimeout = 30000 } = req.body;

    // Verify user is faculty
    if (req.user.role !== "faculty") {
      return res.status(403).json({
        success: false,
        message: "Only faculty members can enable camera detection",
      });
    }

    const service = await getCameraDetectionService();
    if (!service) {
      return res.status(503).json({
        success: false,
        message: "Camera detection service is not available",
      });
    }

    const io = req.app.get("io");
    const result = await service.startCameraDetection(facultyId, cameraDeviceId, io);

    if (result.success) {
      // Update detection timeout if provided
      const availability = await FacultyAvailability.findOne({ faculty: facultyId });
      if (availability && detectionTimeout) {
        availability.detectionTimeout = detectionTimeout;
        await availability.save();
      }
    }

    res.json(result);
  } catch (err) {
    console.error("startDetection error:", err);
    res.status(500).json({ success: false, message: "Failed to start detection" });
  }
};

/**
 * 🛑 Stop camera-based presence detection
 */
export const stopDetection = async (req, res) => {
  try {
    const facultyId = req.user._id;

    if (req.user.role !== "faculty") {
      return res.status(403).json({
        success: false,
        message: "Only faculty members can disable camera detection",
      });
    }

    const service = await getCameraDetectionService();
    if (!service) {
      return res.status(503).json({
        success: false,
        message: "Camera detection service is not available",
      });
    }

    const result = await service.stopCameraDetection(facultyId);
    res.json(result);
  } catch (err) {
    console.error("stopDetection error:", err);
    res.status(500).json({ success: false, message: "Failed to stop detection" });
  }
};

/**
 * 📊 Get camera detection status
 */
export const getDetectionStatusController = async (req, res) => {
  try {
    const facultyId = req.user._id;
    const service = await getCameraDetectionService();
    if (!service) {
      return res.status(503).json({
        success: false,
        message: "Camera detection service is not available",
      });
    }
    const status = await service.getDetectionStatus(facultyId);
    res.json({ success: true, status });
  } catch (err) {
    console.error("getDetectionStatus error:", err);
    res.status(500).json({ success: false, message: "Failed to get status" });
  }
};

/**
 * 📸 Process frame from webcam (fallback method)
 */
export const processFrameController = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No image file provided",
      });
    }

    const facultyId = req.user._id;
    const imageBuffer = req.file.buffer;

    const service = await getCameraDetectionService();
    if (!service) {
      return res.status(503).json({
        success: false,
        message: "Camera detection service is not available",
      });
    }

    const io = req.app.get("io");
    await service.processFrame(facultyId, imageBuffer, io);

    res.json({ success: true, message: "Frame processed" });
  } catch (err) {
    console.error("processFrame error:", err);
    res.status(500).json({ success: false, message: "Failed to process frame" });
  }
};
