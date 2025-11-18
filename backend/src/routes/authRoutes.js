import express from "express";
import multer from "multer";

import {
  register,
  loginUser,
  getProfile,
  getAllUsers,
  deleteUser,
  updateUser,
  forgotPassword,
  resetPassword,
} from "../controllers/authController.js";

import {
  bulkUploadStudents,
  bulkUploadFaculty,
  bulkUploadAdmins,
} from "../controllers/bulkUserController.js";

import { checkEmail } from "../controllers/authExtraController.js";
import { verifyToken, requireRoles } from "../middlewares/authMiddleware.js";
import upload from "../middlewares/uploadMiddleware.js";

const router = express.Router();

// -----------------------------------------
// CHECK EMAIL EXISTS (Login validation)
// -----------------------------------------
router.post("/check-email", checkEmail);

// -----------------------------------------
// LOGIN
// -----------------------------------------
router.post("/login", loginUser);

// -----------------------------------------
// REGISTER USER (with photo upload)
// -----------------------------------------
router.post("/register", upload.single("photo"), register);

// -----------------------------------------
// GET PROFILE
// -----------------------------------------
router.get("/profile", verifyToken, getProfile);

// -----------------------------------------
// GET ALL USERS (Admin only)
// -----------------------------------------
router.get(
  "/all-users",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  getAllUsers
);

// -----------------------------------------
// UPDATE USER (Admin only)
// -----------------------------------------
router.put(
  "/update/:id",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  updateUser
);

// -----------------------------------------
// DELETE USER (Admin only)
// -----------------------------------------
router.delete(
  "/delete/:id",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  deleteUser
);

// -----------------------------------------
// PASSWORD RESET
// -----------------------------------------
router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

// -----------------------------------------
// BULK UPLOAD (Students / Faculty / Admins)
// -----------------------------------------
const zipUpload = multer({ dest: "uploads/tmp" });

router.post(
  "/bulk-upload/students",
  verifyToken,
  requireRoles("superadmin", "department_admin"),
  zipUpload.single("zipFile"),
  bulkUploadStudents
);

router.post(
  "/bulk-upload/faculty",
  verifyToken,
  requireRoles("superadmin", "department_admin"),
  zipUpload.single("zipFile"),
  bulkUploadFaculty
);

router.post(
  "/bulk-upload/admins",
  verifyToken,
  requireRoles("superadmin"),
  zipUpload.single("zipFile"),
  bulkUploadAdmins
);

export default router;
