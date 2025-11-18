// backend/src/routes/users.js
import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController.js";
import { verifyToken, requireRoles } from "../middlewares/authMiddleware.js";

const router = Router();

// ✅ Only superadmin, admin, department_admin can create users manually
router.post(
  "/",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin"),
  createUser
);

// ✅ All admins can list; department_admin auto-filtered to their dept
router.get(
  "/",
  verifyToken,
  requireRoles("superadmin", "admin", "department_admin", "functional_admin"),
  listUsers
);

export default router;
