import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  getMyStatus,
  updateStatus,
} from "../controllers/facultyStatusController.js";

const router = express.Router();

router.get("/status/me", verifyToken, getMyStatus);
router.put("/status/update", verifyToken, updateStatus);

export default router;
