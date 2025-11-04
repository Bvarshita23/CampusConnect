import express from "express";
import { register, login, getProfile } from "../controllers/authController.js";
import { authGuard } from "../middlewares/authMiddleware.js";

const router = express.Router();

// ✅ Public routes
router.post("/register", register);
router.post("/login", login);

// ✅ Protected route (optional)
router.get("/profile", authGuard, getProfile);

export default router;
