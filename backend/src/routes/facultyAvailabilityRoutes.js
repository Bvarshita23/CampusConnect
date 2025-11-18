import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

import {
  updateAvailability,
  getAllAvailability,
  autoSetAvailable,
} from "../controllers/facultyAvailabilityController.js";

const router = express.Router();

/**
 * 🟢 Auto update availability when faculty logs in or dashboard loads
 */
router.post("/auto", verifyToken, autoSetAvailable);

/**
 * 🟡 Manual toggle
 */
router.patch("/update", verifyToken, updateAvailability);

/**
 * 🔵 Get all availability (students/admin/faculty)
 */
router.get("/", verifyToken, getAllAvailability);

export default router;
