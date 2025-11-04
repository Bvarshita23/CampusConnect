import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import fs from "fs";
import { connectDB } from "./config/db.js"; // ✅ Correct import (named, not default)
import authRoutes from "./routes/authRoutes.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import path from "path";
import { fileURLToPath } from "url";
dotenv.config();
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const app = express();
app.use("/uploads", express.static(path.join(__dirname, "../uploads")));
// ✅ Middlewares
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
// Serve uploaded images
app.use("/uploads", express.static("uploads"));

// ✅ Route Mounting
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lostfound", lostFoundRoutes);
app.use("/api/v1/problems", problemRoutes);

// ✅ Test Route
app.get("/", (req, res) => {
  res.send("Campus Connect backend is running 🚀");
});

const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}
app.use("/uploads", express.static(uploadDir));
// ✅ Start Server only after DB connects
const PORT = process.env.PORT || 8080;

connectDB().then(() => {
  app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
});
