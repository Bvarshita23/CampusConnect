import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  updateFacultyStatus,
  getMyStatus,
  getAllFacultyStatuses,
} from "../controllers/facultyController.js";

const router = express.Router();

// ✅ Faculty updates their own status
router.patch("/status/update", verifyToken, updateFacultyStatus);

// ✅ Faculty gets their own status
router.get("/status/me", verifyToken, getMyStatus);

// ✅ Get all faculty statuses (for students/admin)
router.get("/status", verifyToken, getAllFacultyStatuses);

export default router;
