// backend/src/routes/bulkUserRoutes.js
import express from "express";
import multer from "multer";
import { verifyToken, requireRoles } from "../middlewares/authMiddleware.js";
import {
  bulkUploadStudents,
  bulkUploadFaculty,
  bulkUploadAdmins,
} from "../controllers/bulkUserController.js";

const router = express.Router();

// Store uploaded ZIP temporarily
const upload = multer({
  dest: "backend/src/uploads/bulk", // temp folder
  limits: { fileSize: 50 * 1024 * 1024 }, // 50 MB
});

// 🔹 Students bulk upload (superadmin + dept admin)
router.post(
  "/students",
  verifyToken,
  requireRoles("superadmin", "department_admin"),
  upload.single("file"), // field name "file"
  bulkUploadStudents
);

// 🔹 Faculty bulk upload (superadmin + dept admin)
router.post(
  "/faculty",
  verifyToken,
  requireRoles("superadmin", "department_admin"),
  upload.single("file"),
  bulkUploadFaculty
);

// 🔹 Admins bulk upload (only superadmin)
router.post(
  "/admins",
  verifyToken,
  requireRoles("superadmin"),
  upload.single("file"),
  bulkUploadAdmins
);

export default router;
