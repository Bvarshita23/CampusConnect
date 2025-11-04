import express from "express";
import { authRequired } from "../middlewares/authMiddleware.js";
import {
  createProblem,
  getProblems,
  updateStatus,
  addComment,
} from "../controllers/problemController.js";

const router = express.Router();

router.post("/", authRequired, createProblem);
router.get("/", authRequired, getProblems);
router.patch("/:id/status", authRequired, updateStatus);
router.post("/:id/comments", authRequired, addComment);

export default router;
