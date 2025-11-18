import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import morgan from "morgan";
import helmet from "helmet";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { createServer } from "http";
import { Server } from "socket.io";
import bcrypt from "bcryptjs";
import facultyStatusRoutes from "./routes/facultyStatusRoutes.js";
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
import bookingRoutes from "./routes/bookingRoutes.js";
// ROUTES
import notificationRoutes from "./routes/notificationRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";
import problemRoutes from "./routes/problemRoutes.js";
import facultyRoutes from "./routes/facultyRoutes.js";
import queueRoutes from "./routes/queueRoutes.js";
import testMailRoutes from "./routes/testMail.js";
import claimRoutes from "./routes/claimRoutes.js";
import facultyAvailabilityRoutes from "./routes/facultyAvailabilityRoutes.js";
import bulkUserRoutes from "./routes/bulkUserRoutes.js";

dotenv.config();

// PATH SETUP
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// EXPRESS & SOCKET
const app = express();
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// Make io available everywhere
app.set("io", io);

// ===============================
// 🔥 FIXED STATIC UPLOADS MOUNT
// ===============================

// Ensure uploads folder exists inside src
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Serve static images CORRECTLY
// THIS is the CORRECT one (inside /src/uploads)
app.use("/uploads", express.static("public_uploads"));

// ===============================
// MIDDLEWARE
// ===============================
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use("/uploads", express.static("uploads"));

app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());

// ===============================
// ROUTES
// ===============================
app.use("/api/v1/bulk-upload", bulkUserRoutes);
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lostfound", lostFoundRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/faculty", facultyRoutes);
app.use("/api/v1/queue", queueRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.use("/api/v1/test", testMailRoutes);
app.use("/api/v1/faculty-availability", facultyAvailabilityRoutes);
app.use("/api/v1/faculty", facultyStatusRoutes);
app.use("/api/v1/bookings", bookingRoutes);
// HEALTH
app.get("/", (req, res) => res.send("Campus Connect backend is running 🚀"));
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasMongoUri: !!process.env.MONGO_URI,
    },
  });
});

// ===============================
// SUPER ADMIN RESET
// ===============================
const resetSuperAdmin = async () => {
  try {
    const email = "superadmin@campusconnect.com";
    const plainPassword = "Super@123";

    await User.deleteOne({ email });

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await User.create({
      name: "Campus Super Admin",
      email,
      password: hashedPassword,
      role: "superadmin",
      department: "Management",
    });

    console.log("✅ Super Admin created:");
    console.log("➡️ Email:", email);
    console.log("➡️ Password:", plainPassword);
  } catch (error) {
    console.error("❌ Failed to create Super Admin:", error);
  }
};

// ===============================
// SOCKET.IO EVENTS
// ===============================
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on("join-faculty-status", () => {
    socket.join("faculty-status");
  });

  socket.on("disconnect", () =>
    console.log(`❌ Client disconnected: ${socket.id}`)
  );
});

// ===============================
// START SERVER
// ===============================
const PORT = process.env.PORT || 8080;

const startServer = async () => {
  try {
    await connectDB();
    await resetSuperAdmin();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error);
    process.exit(1);
  }
};

startServer();

// Export io
export { io };
