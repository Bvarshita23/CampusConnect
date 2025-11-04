import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "../models/User.js";
// Fix __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/../.env` });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

const seedUsers = async () => {
  try {
    console.log("🧹 Clearing old users...");
    await mongoose.connect(MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    // Clear existing users
    await User.deleteMany({});

    // Create new users
    const users = [
      {
        name: "Campus Admin",
        email: "campusadmin@campus.edu",
        password: await bcrypt.hash("Admin@123", 10),
        role: "admin",
      },
      {
        name: "Faculty User",
        email: "faculty@bitm.edu.in",
        password: await bcrypt.hash("Faculty@123", 10),
        role: "faculty",
      },
      {
        name: "Varshita Bellamkonda",
        email: "varshita23@bitm.edu.in",
        password: await bcrypt.hash("Varshita@123", 10),
        role: "student",
      },
    ];

    // Insert all users
    await User.insertMany(users);

    console.log("\n✅ Users seeded successfully!\n");
    console.table(
      users.map(({ name, email, role }) => ({ name, email, role }))
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding users:", error);
    process.exit(1);
  }
};

seedUsers();
