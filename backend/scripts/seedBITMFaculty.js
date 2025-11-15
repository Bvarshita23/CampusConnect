import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";
import { dirname } from "path";
import User from "../src/models/User.js";
import { connectDB } from "../src/config/db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: `${__dirname}/../.env` });

const MONGO_URI = process.env.MONGO_URI;

if (!MONGO_URI) {
  console.error("❌ MONGO_URI not found in .env file");
  process.exit(1);
}

// Helper function to generate email from name
const generateEmail = (name) => {
  let cleanName = name
    .toLowerCase()
    .replace(/dr\.?\s*/g, "")
    .replace(/mr\.?\s*/g, "")
    .replace(/mrs\.?\s*/g, "")
    .replace(/ms\.?\s*/g, "")
    .replace(/professor\s*/g, "")
    .replace(/\./g, " ") // Replace dots with spaces first
    .replace(/\s+/g, ".") // Then replace spaces with dots
    .replace(/[^a-z.]/g, "") // Remove non-alphabetic characters except dots
    .replace(/\.+/g, ".") // Replace multiple dots with single dot
    .replace(/^\.|\.$/g, ""); // Remove leading/trailing dots
  
  // Handle special cases
  if (cleanName.length === 0) {
    cleanName = "faculty";
  }
  
  return `${cleanName}@bitm.edu.in`;
};

// Helper function to determine gender and assign profile picture
const getProfilePicture = (name) => {
  const nameLower = name.toLowerCase();
  
  // Check for explicit gender indicators
  if (nameLower.includes("mrs.") || nameLower.includes("ms.") || 
      nameLower.includes("miss") || nameLower.includes("prof.")) {
    // Check if it's actually a female name
    const femaleIndicators = ["mrs", "ms", "miss", "rachel", "evangeline", "christian", 
      "pratibha", "shwethashree", "sowbhagya", "harshitha", "nilam", "ghousia", 
      "shilpa", "sumalatha", "simantini", "swetha", "nayana", "vijayarani", 
      "chandrakala", "farzana", "parvathi", "nandini", "hafsa", "javeria", 
      "shireen", "sushma", "vasanti", "kavita", "harshitha", "nanda", "vidyavathi",
      "renuka", "girija", "lakshmi", "aarthi", "shaheeda", "ashritha"];
    
    for (const indicator of femaleIndicators) {
      if (nameLower.includes(indicator)) {
        return "/uploads/profiles/facultys/female-default.jpg";
      }
    }
  }
  
  // Check for common female first names
  const femaleFirstNames = ["rachel", "evangeline", "pratibha", "shwethashree", 
    "sowbhagya", "harshitha", "nilam", "ghousia", "shilpa", "sumalatha", 
    "simantini", "swetha", "nayana", "vijayarani", "chandrakala", "farzana", 
    "parvathi", "nandini", "hafsa", "javeria", "shireen", "sushma", "vasanti", 
    "kavita", "nanda", "vidyavathi", "renuka", "girija", "lakshmi", "aarthi", 
    "shaheeda", "ashritha", "janet"];
  
  // Extract first name (after title)
  const nameParts = nameLower.replace(/^(dr|mr|mrs|ms|prof)\.?\s*/i, "").split(/\s+/);
  const firstName = nameParts[0] || "";
  
  for (const femaleName of femaleFirstNames) {
    if (firstName.includes(femaleName) || nameLower.includes(femaleName)) {
      return "/uploads/profiles/facultys/female-default.jpg";
    }
  }
  
  // Default to male
  return "/uploads/profiles/facultys/male-default.jpg";
};

// BITM Faculty List by Department
const facultyData = [
  // Department of Artificial Intelligence & Machine Learning
  {
    name: "Dr. B M Vidyavathi",
    department: "AIML",
    designation: "Professor & Head",
    experience: "32 years",
  },
  {
    name: "Dr. Noorullah Shariff C",
    department: "AIML",
    designation: "Professor",
    experience: "37 years",
  },
  {
    name: "Dr. Mallikarjuna A",
    department: "AIML",
    designation: "Professor & Assistant HOD",
    experience: "17 years",
  },
  {
    name: "Dr. Renuka Sagar",
    department: "AIML",
    designation: "Professor",
    experience: "18 years",
  },
  {
    name: "Mr. Praveen Kumar C T M",
    department: "AIML",
    designation: "Assistant Professor",
    experience: "11.5 years",
  },
  {
    name: "Ms. Rachel Evangeline Christian",
    department: "AIML",
    designation: "Assistant Professor",
    experience: "3 years",
  },
  {
    name: "Mr. Shaik Mohammed Zaheed Hussain",
    department: "AIML",
    designation: "Teaching Assistant",
    experience: "3 months",
  },
  {
    name: "Mr. Besta Chinnappa",
    department: "AIML",
    designation: "Instructor",
    experience: "1.9 years",
  },
  {
    name: "Mr. Mohammed Irshad Ali",
    department: "AIML",
    designation: "Instructor",
    experience: "30+ years",
  },
  {
    name: "Ms. R Sai Ashritha",
    department: "AIML",
    designation: "Supervisor",
    experience: "3 months",
  },

  // Department of Computer Science & Engineering
  {
    name: "Dr. Aradhana D",
    department: "CSE",
    designation: "Professor & Head (Data Science)",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Yeresime Suresh",
    department: "CSE",
    designation: "Professor & HOD (Artificial Intelligence)",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. R N Kulkarni",
    department: "CSE",
    designation: "Professor & Head CSE, Dean",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. P Paniram Prasad",
    department: "CSE",
    designation: "Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. C.k. Sreenivas",
    department: "CSE",
    designation: "Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Muhibur Rahman T.R",
    department: "CSE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Chidananda H",
    department: "CSE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Sudhakar Avareddy",
    department: "CSE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Sheetal Janthakal",
    department: "CSE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Pratibha Mishra",
    department: "CSE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Usman K",
    department: "CSE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Virupaksha Gouda R",
    department: "CSE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. T.m. Hayath",
    department: "CSE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Dadapeer",
    department: "CSE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Md. Shafiulla",
    department: "CSE",
    designation: "Assistant Professor",
    experience: "14 years",
  },
  {
    name: "Ms. Shwethashree A",
    department: "CSE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Hari Krishna H",
    department: "CSE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },

  // Department of Electronics & Communication Engineering
  {
    name: "Dr. Shiva Kumar K.S",
    department: "ECE",
    designation: "Professor & Head",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Premachand D R",
    department: "ECE",
    designation: "Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Naseeruddin",
    department: "ECE",
    designation: "Associate Professor & Assistant HOD",
    experience: "17 years",
  },
  {
    name: "Dr. Fareduddin Ahmed J S",
    department: "ECE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. William Thomas H.M",
    department: "ECE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Abdul Lateef Haroon P.S",
    department: "ECE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Girija Vani G",
    department: "ECE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Prabhakar K",
    department: "ECE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Vishnu Kanth Karwa",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Sowbhagya B",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Sagara T.V",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Ambrayya",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Harshitha K R",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Nilam Chheda",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Srikantha K.M",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Hemanthakumar R Kappali",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Ghousia Sanober Sabreen",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Manjunath G",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Shilpa K.R",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Sumalatha Venkob Rao",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Simantini Roy Chowdhury",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Ulaganathan J",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Swetha N",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Vinaykumar Javalkar",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Aswathanarayana",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Nayana M",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Udayraj Kumar M",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Vijayarani T",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Chandrakala B A",
    department: "ECE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },

  // Department of Electrical & Electronics Engineering
  {
    name: "Dr. Sharana Reddy",
    department: "EEE",
    designation: "Professor & HOD",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Abdul Khadar",
    department: "EEE",
    designation: "Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Aarthi P B",
    department: "EEE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Raghavendra P",
    department: "EEE",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Farzana Begum K",
    department: "EEE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Parvathi",
    department: "EEE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Shridhar S M",
    department: "EEE",
    designation: "Assistant Professor",
    experience: "15 years",
  },
  {
    name: "Mr. Mahammad Anwar",
    department: "EEE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Nandini Patil",
    department: "EEE",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },

  // Department of Mechanical Engineering
  {
    name: "Dr. Yadavalli Basavaraj",
    department: "ME",
    designation: "Principal and Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. V. Venkata Ramana",
    department: "ME",
    designation: "Professor & HOD",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Raghavendra Joshi",
    department: "ME",
    designation: "Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. B. Ganesh",
    department: "ME",
    designation: "Associate Professor & Assistant HOD",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Manjunatha .T.H",
    department: "ME",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Banakara Nagaraj",
    department: "ME",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Lakshmi Kumari",
    department: "ME",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Santhosh V Janamatti",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Shivaramakrishna .A",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Pavan Kumar .B. K",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Vishnu Prasad B",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. B.P. Vijay Kumar",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. K.C. Venkatesh",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. K. Rajashekar",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Gavisiddesha .P",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Raghavendra Karnool",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. A. Taranath",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. G Raghavendra Setty",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. B. Maharaja Gouda",
    department: "ME",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },

  // Department of Humanities
  {
    name: "Dr. Laxmikant Kulkarni",
    department: "Humanities",
    designation: "HOD Department of Humanities",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Mallikarjuna NM",
    department: "Humanities",
    designation: "Assistant Professor",
    experience: "22 years",
  },
  {
    name: "Ms. Hafsa Noorain",
    department: "Humanities",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Javeria",
    department: "Humanities",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Shireen Taj",
    department: "Humanities",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Md .Asif L",
    department: "Humanities",
    designation: "Instructor",
    experience: null, // Experience data not available
  },

  // Department of Master of Business Administration
  {
    name: "Dr. Janet Jyothi Dsouza",
    department: "MBA",
    designation: "Professor & HOD",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Shaheeda Banu S",
    department: "MBA",
    designation: "Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Christopher Raj D",
    department: "MBA",
    designation: "Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. K Srinivasa Murthy",
    department: "MBA",
    designation: "Professor of Practice",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Dinesh K",
    department: "MBA",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Pavan Kumar S S",
    department: "MBA",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Ravi Kumar J S",
    department: "MBA",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Khaja Mohinuddeen J",
    department: "MBA",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Dr. Sathvik S",
    department: "MBA",
    designation: "Associate Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Sampath Kumar",
    department: "MBA",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Sushma Premkalal",
    department: "MBA",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. T. Vasanti",
    department: "MBA",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Kavita Achchalli",
    department: "MBA",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Ms. Harshitha.G",
    department: "MBA",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mrs. Nanda Dinni",
    department: "MBA",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Syed Salauddin Hussaini",
    department: "MBA",
    designation: "Assistant Professor",
    experience: null, // Experience data not available
  },
  {
    name: "Mr. Mohammed Khalid R.",
    department: "MBA",
    designation: "Assistant Professor",
    experience: "15 years",
  },
];

const seedBITMFaculty = async () => {
  try {
    console.log("🔌 Connecting to MongoDB...");
    await connectDB();

    console.log("📝 Starting to seed BITM faculty members...\n");

    const defaultPassword = "Faculty@123";
    // Note: Don't hash password here - User model's pre-save hook will do it

    let created = 0;
    let skipped = 0;
    const errors = [];

    for (const faculty of facultyData) {
      try {
        const email = generateEmail(faculty.name);

        // Check if faculty already exists
        const existing = await User.findOne({ email });
        if (existing) {
          console.log(`⏭️  Skipped: ${faculty.name} (${email}) - already exists`);
          skipped++;
          continue;
        }

        // Get profile picture based on gender
        const photo = getProfilePicture(faculty.name);

        // Create faculty user - password will be hashed by User model's pre-save hook
        await User.create({
          name: faculty.name,
          email: email,
          password: defaultPassword, // Plain password - will be hashed automatically
          role: "faculty",
          department: faculty.department,
          designation: faculty.designation || null,
          experience: faculty.experience || null,
          photo: photo,
        });

        console.log(`✅ Created: ${faculty.name.padEnd(40)} | ${email} | ${faculty.department}`);
        created++;
      } catch (error) {
        console.error(`❌ Error creating ${faculty.name}:`, error.message);
        errors.push({ name: faculty.name, error: error.message });
      }
    }

    console.log("\n" + "=".repeat(60));
    console.log("📊 Seeding Summary:");
    console.log(`✅ Created: ${created} faculty members`);
    console.log(`⏭️  Skipped: ${skipped} (already exist)`);
    console.log(`❌ Errors: ${errors.length}`);
    console.log("=".repeat(60));

    if (errors.length > 0) {
      console.log("\n❌ Errors encountered:");
      errors.forEach((e) => console.log(`  - ${e.name}: ${e.error}`));
    }

    console.log(`\n🔑 Default password for all faculty: ${defaultPassword}`);
    console.log("📧 Email format: firstname.lastname@bitm.edu.in\n");

    await mongoose.disconnect();
    console.log("✅ Database connection closed");
    process.exit(0);
  } catch (error) {
    console.error("❌ Error seeding faculty:", error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

seedBITMFaculty();

