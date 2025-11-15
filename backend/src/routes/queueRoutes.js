import express from "express";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Get current queue tickets (temporary public)
router.get("/my", verifyToken, (req, res) => {
  res.json({
    success: true,
    message: "Queue route working ✅",
    tickets: [
      { id: 1, student: "Varshita", purpose: "Admin Office" },
      { id: 2, student: "Manasa", purpose: "Library" },
    ],
  });
});

export default router;
