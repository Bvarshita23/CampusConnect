import express from "express";
import multer from "multer";
import { authGuard } from "../middlewares/authMiddleware.js";
import {
  createItem,
  getItems,
  verifyClaim,
  deleteItem,
} from "../controllers/lostFoundController.js";

const router = express.Router();

const storage = multer.diskStorage({
  destination: (_, __, cb) => cb(null, "uploads/"),
  filename: (_, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

router.post("/", authGuard, upload.single("image"), createItem);
router.get("/", authGuard, getItems);
router.post("/:id/verify", authGuard, verifyClaim);
router.delete("/:id", authGuard, deleteItem);

export default router;
