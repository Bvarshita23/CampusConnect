import mongoose from "mongoose";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/../.env` });

const fixFacultyPasswords = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();

    console.log("\n🔧 Fixing faculty passwords...\n");

    const defaultPassword = "Faculty@123";
    const faculty = await User.find({ role: "faculty" });

    if (faculty.length === 0) {
      console.log("❌ No faculty members found.");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`Found ${faculty.length} faculty members to fix.\n`);

    let fixed = 0;
    for (const user of faculty) {
      try {
        // Set password to plain text - User model's pre-save hook will hash it
        user.password = defaultPassword;
        await user.save();
        console.log(`✅ Fixed: ${user.name} (${user.email})`);
        fixed++;
      } catch (error) {
        console.error(`❌ Error fixing ${user.name}:`, error.message);
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log(`✅ Fixed passwords for ${fixed} faculty members`);
    console.log(`🔑 New password: ${defaultPassword}`);
    console.log("=".repeat(60) + "\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error fixing passwords:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

fixFacultyPasswords();

