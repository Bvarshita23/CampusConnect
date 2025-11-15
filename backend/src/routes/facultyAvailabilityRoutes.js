import express from "express";
import multer from "multer";
import {
  updateAvailability,
  uploadFacultyImage,
  cameraUpdateAvailability,
  getAllAvailability,
  startDetection,
  stopDetection,
  getDetectionStatusController,
  processFrameController,
} from "../controllers/facultyAvailabilityController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Multer config for image uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ✅ Multer config for frame processing (memory storage for faster processing)
const memoryStorage = multer.memoryStorage();
const uploadFrame = multer({ storage: memoryStorage });

// Faculty update status
router.patch("/update", verifyToken, updateAvailability);

// Upload image (faculty face)
router.post(
  "/upload-image",
  verifyToken,
  upload.single("photo"),
  uploadFacultyImage
);

// Camera update: upload photo and mark available (not manual)
router.post(
  "/camera-update",
  verifyToken,
  upload.single("photo"),
  cameraUpdateAvailability
);

// Get all availability (for students/admin)
router.get("/", verifyToken, getAllAvailability);

// Camera detection endpoints
router.post("/camera/start", verifyToken, startDetection);
router.post("/camera/stop", verifyToken, stopDetection);
router.get("/camera/status", verifyToken, getDetectionStatusController);
router.post(
  "/camera/process-frame",
  verifyToken,
  uploadFrame.single("frame"),
  processFrameController
);

export default router;
