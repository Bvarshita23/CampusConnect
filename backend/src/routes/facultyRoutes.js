import express from "express";
import { verifyToken, requireRoles } from "../middlewares/authMiddleware.js";
import {
  getMyStatus,
  updateStatus,
  getAllStatuses,
} from "../controllers/facultyStatusController.js";

const router = express.Router();

// View own status
router.get("/status/me", verifyToken, getMyStatus);

// Update own status
router.put("/status/update", verifyToken, updateStatus);

// Admin / Superadmin access
router.get(
  "/status/all",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  getAllStatuses
);

export default router;
