import express from "express";
import {
  getMyNotifications,
  markAllAsRead,
} from "../controllers/notificationController.js";
import { verifyToken } from "../middlewares/authMiddleware.js";

const router = express.Router();

// Get my notifications
router.get("/my", verifyToken, getMyNotifications);

// Mark all as read
router.patch("/read-all", verifyToken, markAllAsRead);

export default router;
