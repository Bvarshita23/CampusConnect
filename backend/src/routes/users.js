import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController.js";
import { authGuard, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();
router.get(
  "/",
  authGuard,
  requireRole(["admin", "superadmin", "department_admin"]),
  listUsers
);

router.post("/", authGuard, requireRoles("admin", "superadmin"), createUser);

export default router;
