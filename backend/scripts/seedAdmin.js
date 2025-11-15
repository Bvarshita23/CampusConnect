import dotenv from "dotenv";
dotenv.config();
import mongoose from "mongoose";
import bcrypt from "bcrypt";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

await connectDB();

const password = await bcrypt.hash("Admin@123", 10);
await User.create({
  name: "Campus Admin",
  email: "campusadmin@campus.edu",
  password,
  role: "admin",
});

console.log("✅ Admin seeded successfully");
await mongoose.disconnect();
process.exit(0);