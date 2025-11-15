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
import { connectDB } from "./config/db.js";
import User from "./models/User.js";
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

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const httpServer = createServer(app);

// ✅ Socket.io setup with CORS
const io = new Server(httpServer, {
  cors: {
    origin: ["http://localhost:5173"],
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ✅ Make io available globally for controllers
app.set("io", io);

// ✅ Middleware setup
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: true,
  })
);
app.use("/api/v1/bulk-upload", bulkUserRoutes);
app.use(helmet());
app.use(morgan("dev"));
app.use(express.json());
app.get("/api/v1/test/add-faculty", async (req, res) => {
  try {
    const faculties = [
      {
        name: "Dr. John Smith",
        email: "john.smith@campusconnect.com",
        password: "Faculty@123",
        role: "faculty",
        department: "Computer Science",
      },
      {
        name: "Dr. Emily Davis",
        email: "emily.davis@campusconnect.com",
        password: "Faculty@123",
        role: "faculty",
        department: "Electronics",
      },
    ];

    for (let f of faculties) {
      const existing = await User.findOne({ email: f.email });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(f.password, 10);
        await User.create({ ...f, password: hashedPassword });
      }
    }

    res.json({ success: true, message: "✅ Sample faculty users added!" });
  } catch (err) {
    console.error(err);
    res
      .status(500)
      .json({ success: false, message: "Failed to create faculty users" });
  }
});

// ✅ Test endpoint to check if user exists
app.get("/api/v1/test/check-user", async (req, res) => {
  try {
    const { email } = req.query;
    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Please provide email query parameter",
      });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (user) {
      res.json({
        success: true,
        found: true,
        user: {
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
        },
      });
    } else {
      res.json({
        success: true,
        found: false,
        message: "User not found",
      });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

// ✅ Quick fix: Create test faculty user for immediate login
app.get("/api/v1/test/create-test-faculty", async (req, res) => {
  try {
    const testFaculty = {
      name: "Dr. B M Vidyavathi",
      email: "b.m.vidyavathi@bitm.edu.in",
      password: "Faculty@123",
      role: "faculty",
      department: "AIML",
    };

    // Check if already exists
    const existing = await User.findOne({ email: testFaculty.email });
    if (existing) {
      return res.json({
        success: true,
        message: "✅ Test faculty already exists!",
        user: {
          name: existing.name,
          email: existing.email,
          role: existing.role,
        },
        login: {
          email: testFaculty.email,
          password: testFaculty.password,
        },
      });
    }

    // Create the user - password will be hashed by User model's pre-save hook
    const user = await User.create({
      ...testFaculty,
      password: testFaculty.password, // Plain password - will be hashed automatically
    });

    res.json({
      success: true,
      message: "✅ Test faculty user created successfully!",
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
      },
      login: {
        email: testFaculty.email,
        password: testFaculty.password,
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      success: false,
      message: "Failed to create test faculty",
      error: err.message,
    });
  }
});
// ✅ Ensure uploads folder exists
const uploadDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });
app.use("/uploads", express.static(uploadDir));

// ✅ Routes

app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/lostfound", lostFoundRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/faculty", facultyRoutes);
app.use("/api/v1/queue", queueRoutes);
app.use("/api/v1/notifications", notificationRoutes);
app.get("/", (req, res) => res.send("Campus Connect backend is running 🚀"));
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    timestamp: new Date().toISOString(),
    env: {
      hasJwtSecret: !!process.env.JWT_SECRET,
      hasMongoUri: !!process.env.MONGO_URI,
      nodeEnv: process.env.NODE_ENV || "development",
    },
  });
});
app.use("/api/v1/test", testMailRoutes);
app.use("/api/v1/faculty-availability", facultyAvailabilityRoutes);
const PORT = process.env.PORT || 8080;

// ✅ Function to reset and create Super Admin
const resetSuperAdmin = async () => {
  try {
    const email = "superadmin@campusconnect.com";
    const plainPassword = "Super@123";

    await User.deleteOne({ email });
    console.log("🗑️  Old Super Admin deleted (if existed)");

    const hashedPassword = await bcrypt.hash(plainPassword, 10);
    await User.create({
      name: "Campus Super Admin",
      email,
      password: hashedPassword,
      role: "superadmin",
      department: "Management",
    });

    console.log("✅ New Super Admin created");
    console.log("➡️  Email:", email);
    console.log("➡️  Password:", plainPassword);
  } catch (error) {
    console.error("❌ Error creating Super Admin:", error.message);
  }
};

// ✅ Socket.io connection handling
io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  // Join room for faculty status updates
  socket.on("join-faculty-status", () => {
    socket.join("faculty-status");
    console.log(`Client ${socket.id} joined faculty-status room`);
  });

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

// ✅ Connect to DB, then start server
const startServer = async () => {
  try {
    await connectDB(); // Wait for DB connection
    await resetSuperAdmin();

    httpServer.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
      console.log(`🔌 Socket.io server ready`);
    });
  } catch (error) {
    console.error("❌ Failed to start server:", error.message);
    process.exit(1);
  }
};

startServer();

// Export io for use in controllers
export { io };
