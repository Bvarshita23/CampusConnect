// backend/src/routes/authRoutes.js
import express from "express";
import upload from "../middlewares/uploadMiddleware.js";
import {
  register,
  loginUser,
  getProfile,
  getAllUsers,
  deleteUser,
  updateUser,
} from "../controllers/authController.js";
import { verifyToken, requireRoles } from "../middlewares/authMiddleware.js";
import {
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";
const router = express.Router();

// Public login
router.post("/login", loginUser);

// Public registration for student/faculty
router.post("/register", upload.single("photo"), register);

// Current user profile
router.get("/profile", verifyToken, getProfile);
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);
// Admin-only area
router.get(
  "/all-users",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  getAllUsers
);

router.put(
  "/update/:id",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  upload.single("photo"),
  updateUser
);

router.delete(
  "/delete/:id",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  deleteUser
);

export default router;
