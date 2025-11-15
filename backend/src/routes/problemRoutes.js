import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  createProblem,
  getAllProblems,
  getMyProblems,
  updateProblemStatus,
} from "../controllers/problemController.js";

const router = express.Router();

// ✅ Add new problem (student/faculty)
router.post("/", verifyToken, createProblem);

// ✅ Get only logged-in user’s problems
router.get("/my", verifyToken, getMyProblems);

// ✅ Get all problems (for everyone to view)
router.get("/", verifyToken, getAllProblems);

// ✅ Update problem status (admin/superadmin)
router.patch("/:id/status", verifyToken, updateProblemStatus);

export default router;
