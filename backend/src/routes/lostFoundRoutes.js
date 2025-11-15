import express from "express";
import multer from "multer";
import {
  createItem,
  getItems,
  verifyClaim,
  markReturned,
  deleteItem,
  getHistory,
} from "../controllers/lostFoundController.js";
import { verifyToken as protect } from "../middlewares/authMiddleware.js";
import LostFound from "../models/LostFound.js";

const router = express.Router();

// ✅ Multer setup — ensure uploads/ exists at project root (same level as server.js)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// ✅ Create lost/found item
router.post("/", protect, upload.single("photo"), createItem);

// ✅ Get all items
router.get("/", protect, getItems);

// ✅ Verify claim
router.post("/verify/:id", protect, verifyClaim);

// ✅ Mark returned
router.patch("/return/:id", protect, markReturned);

// ✅ Delete item
router.delete("/:id", protect, deleteItem);

// ✅ Get user history
router.get("/history", protect, getHistory);

// ✅ Fetch items posted by the logged-in user
router.get("/my", protect, async (req, res) => {
  try {
    const myItems = await LostFound.find({ postedBy: req.user._id }).sort({
      createdAt: -1,
    });
    res.json({ success: true, items: myItems });
  } catch (err) {
    console.error("getMyItems error:", err);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch your items" });
  }
});

export default router;
