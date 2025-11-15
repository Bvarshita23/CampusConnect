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

const listFacultyEmails = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();

    console.log("\n📋 Fetching all faculty members...\n");

    const faculty = await User.find({ role: "faculty" })
      .select("name email department")
      .sort({ department: 1, name: 1 });

    if (faculty.length === 0) {
      console.log("❌ No faculty members found in database.");
      console.log("💡 Run: npm run seed:bitm-faculty\n");
      await mongoose.disconnect();
      process.exit(0);
    }

    console.log(`✅ Found ${faculty.length} faculty members:\n`);
    console.log("=".repeat(80));

    // Group by department
    const byDepartment = {};
    faculty.forEach((f) => {
      const dept = f.department || "Unknown";
      if (!byDepartment[dept]) {
        byDepartment[dept] = [];
      }
      byDepartment[dept].push(f);
    });

    // Display by department
    Object.keys(byDepartment)
      .sort()
      .forEach((dept) => {
        console.log(`\n📚 ${dept} (${byDepartment[dept].length} faculty)`);
        console.log("-".repeat(80));
        byDepartment[dept].forEach((f) => {
          console.log(`  👤 ${f.name.padEnd(40)} | ${f.email}`);
        });
      });

    console.log("\n" + "=".repeat(80));
    console.log(`\n🔑 Default Password: Faculty@123`);
    console.log(`\n📧 Total Faculty: ${faculty.length}\n`);

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error("❌ Error listing faculty:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

listFacultyEmails();

