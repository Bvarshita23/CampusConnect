import { Router } from "express";
import { createUser, listUsers } from "../controllers/userController.js";
import { authGuard, requireRole } from "../middlewares/authMiddleware.js";

const router = Router();
router.post("/", authGuard, requireRole("admin"), createUser);
router.get("/", authGuard, requireRole("admin"), listUsers);
export default router;
