import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/users.js";
import lostFoundRoutes from "./routes/lostFoundRoutes.js";

const app = express();

app.use(express.json());
app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
app.use(helmet());
app.use(rateLimit({ windowMs: 60 * 1000, max: 100 }));

app.get("/api/v1/health", (_, res) => res.json({ ok: true }));
app.use("/api/v1/auth", authRoutes);
app.use("/api/v1/users", userRoutes);
app.use("/api/v1/lostfound", lostFoundRoutes);
app.use("/uploads", express.static("uploads"));

export default app;
