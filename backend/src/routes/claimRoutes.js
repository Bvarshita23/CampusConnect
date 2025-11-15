// src/routes/claimRoutes.js
import express from "express";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import { verifyToken } from "../middlewares/authMiddleware.js";
import {
  raiseClaim,
  uploadProof,
  myClaims,
  allClaims,
} from "../controllers/claimController.js";

const router = express.Router();

// Make sure /uploads/claim-proofs exists
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const proofsDir = path.join(__dirname, "..", "uploads", "claim-proofs");
if (!fs.existsSync(proofsDir)) fs.mkdirSync(proofsDir, { recursive: true });

// Multer for claim proofs
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, proofsDir),
  filename: (req, file, cb) =>
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_")),
});
const upload = multer({ storage });

// Raise a claim (works for both lost & found items)
router.post("/raise", verifyToken, raiseClaim);

// Upload proof (either party)
router.post(
  "/:id/upload-proof",
  verifyToken,
  upload.single("photo"),
  uploadProof
);

// My claims
router.get("/my", verifyToken, myClaims);

// (Optional) Admin view all claims
// Add requireRoles("admin","superadmin") if you want to lock it down
router.get("/all", verifyToken, allClaims);

export default router;
