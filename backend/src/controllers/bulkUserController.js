// backend/src/controllers/bulkUserController.js
import fs from "fs";
import path from "path";
import crypto from "crypto";
import AdmZip from "adm-zip";
import XLSX from "xlsx";
import User from "../models/User.js";
import { sendEmail } from "../utils/emailHelper.js";

const __root = process.cwd();

// 🔐 Generate strong password (B: high security)
const generatePassword = () => {
  const chars =
    "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#$%^&*";
  let pwd = "";
  for (let i = 0; i < 8; i++) {
    const idx = crypto.randomInt(0, chars.length);
    pwd += chars[idx];
  }
  return pwd;
};

// 🧠 Helper: ensure folder exists
const ensureDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// 🧠 Helper: read first .xlsx in the ZIP
const getFirstSheetRows = (zip) => {
  const entry = zip
    .getEntries()
    .find((e) => e.entryName.toLowerCase().endsWith(".xlsx"));

  if (!entry) {
    throw new Error("No .xlsx file found in ZIP");
  }

  const buf = entry.getData();
  const workbook = XLSX.read(buf, { type: "buffer" });
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const rows = XLSX.utils.sheet_to_json(sheet, { defval: "" });
  return rows;
};

// 🧠 Helper: find image buffer by file name inside images/ folder
const findImageEntry = (zip, fileName) => {
  if (!fileName) return null;

  const normalized = fileName.trim().toLowerCase();
  if (!normalized) return null;

  const entry = zip.getEntries().find((e) => {
    const name = e.entryName.toLowerCase();
    return (
      name.endsWith(normalized) &&
      (name.includes("images/") ||
        name.includes("image/") ||
        name.includes("img/") ||
        name.includes("photos/") ||
        name.includes("photo/"))
    );
  });

  return entry || null;
};

// 🧠 Core processor for any role
const processBulkUsers = async ({
  zipFilePath,
  role,
  duplicateMode = "skip", // "skip" | "replace"
  currentAdmin,
}) => {
  const results = {
    added: [],
    replaced: [],
    skipped: [],
    photoMissing: [],
    errors: [],
  };

  try {
    const zip = new AdmZip(zipFilePath);
    const rows = getFirstSheetRows(zip);

    // target upload dir for photos
    // role-based photo directory
    let photoDir = "";

    if (role === "student") {
      photoDir = path.join(__root, "uploads", "profiles", "students");
    } else if (role === "faculty") {
      photoDir = path.join(__root, "uploads", "profiles", "faculty");
    } else if (role === "admin") {
      photoDir = path.join(__root, "uploads", "profiles", "admins");
    }

    ensureDir(photoDir);

    for (let index = 0; index < rows.length; index++) {
      const row = rows[index];
      try {
        if (role === "student") {
          await handleStudentRow({
            row,
            zip,
            photoDir,
            duplicateMode,
            currentAdmin,
            results,
          });
        } else if (role === "faculty") {
          await handleFacultyRow({
            row,
            zip,
            photoDir,
            duplicateMode,
            currentAdmin,
            results,
          });
        } else if (role === "admin") {
          await handleAdminRow({
            row,
            duplicateMode,
            currentAdmin,
            results,
          });
        }
      } catch (rowErr) {
        results.errors.push({
          row: index + 2, // +2: header row + 1-based index
          error: rowErr.message,
        });
      }
    }
  } finally {
    // cleanup temp ZIP
    if (fs.existsSync(zipFilePath)) {
      fs.unlinkSync(zipFilePath);
    }
  }

  return results;
};

// 🎓 Handle student row
const handleStudentRow = async ({
  row,
  zip,
  photoDir,
  duplicateMode,
  currentAdmin,
  results,
}) => {
  let { usn, name, email, department, year, photo } = row;

  usn = String(usn || "").trim();
  name = String(name || "").trim();
  email = String(email || "").trim();
  department = String(department || "").trim();
  year = String(year || "").trim();
  photo = String(photo || "").trim();

  if (!usn || !name || !email) {
    throw new Error("Missing required fields (usn/name/email)");
  }

  // ✅ Dept admin can only add their own department
  if (currentAdmin.role === "department_admin") {
    if (
      currentAdmin.department &&
      department &&
      currentAdmin.department.toLowerCase() !== department.toLowerCase()
    ) {
      throw new Error(
        `Department mismatch. You can only add users of ${currentAdmin.department}`
      );
    }
  }

  // 🔍 Duplicate detection by USN
  let existing = await User.findOne({ usn });

  // photo handling
  let photoPath = null;
  if (photo) {
    const entry = findImageEntry(zip, photo);
    if (entry) {
      const ext = path.extname(photo) || ".jpg";
      const fileName = `student-${usn}${ext}`;
      const fullPath = path.join(photoDir, fileName);
      ensureDir(photoDir);

      fs.writeFileSync(fullPath, entry.getData());
      photoPath = `/uploads/profiles/students/${fileName}`;
    } else {
      results.photoMissing.push({ usn, reason: "Photo file not found" });
    }
  }

  const plainPassword = generatePassword();

  if (existing) {
    if (duplicateMode === "skip") {
      results.skipped.push({ usn, reason: "Duplicate USN" });
      return;
    }

    if (duplicateMode === "replace") {
      existing.name = name;
      existing.email = email;
      existing.department = department || existing.department;
      existing.year = year || existing.year;
      existing.role = "student";
      if (photoPath) existing.photo = photoPath;
      existing.password = plainPassword; // will be hashed by pre-save
      await existing.save();

      // Email new password (best effort)
      try {
        await sendEmail(
          email,
          "Campus Connect account updated",
          `Hi ${name},\n\nYour Campus Connect account details were updated.\n\nEmail: ${email}\nNew Password: ${plainPassword}\n\nPlease log in and change your password.\n\nRegards,\nCampus Connect`
        );
      } catch (e) {
        console.warn("Email send failed (student replace):", e.message);
      }

      results.replaced.push({ usn, email });
      return;
    }
  }

  // No duplicate → create new student
  const user = new User({
    name,
    email,
    role: "student",
    department,
    year,
    usn,
    photo: photoPath,
    password: plainPassword,
  });
  await user.save();

  try {
    await sendEmail(
      email,
      "Campus Connect account created",
      `Hi ${name},\n\nYour Campus Connect account has been created.\n\nEmail: ${email}\nPassword: ${plainPassword}\n\nPlease log in and change your password.\n\nRegards,\nCampus Connect`
    );
  } catch (e) {
    console.warn("Email send failed (student create):", e.message);
  }

  results.added.push({ usn, email });
};

// 👩‍🏫 Faculty row (similar idea, unique by faculty_id)
const handleFacultyRow = async ({
  row,
  zip,
  photoDir,
  duplicateMode,
  currentAdmin,
  results,
}) => {
  let { faculty_id, name, email, department, designation, photo } = row;

  faculty_id = String(faculty_id || "").trim();
  name = String(name || "").trim();
  email = String(email || "").trim();
  department = String(department || "").trim();
  designation = String(designation || "").trim();
  photo = String(photo || "").trim();

  if (!faculty_id || !name || !email) {
    throw new Error("Missing required fields (faculty_id/name/email)");
  }

  if (currentAdmin.role === "department_admin") {
    if (
      currentAdmin.department &&
      department &&
      currentAdmin.department.toLowerCase() !== department.toLowerCase()
    ) {
      throw new Error(
        `Department mismatch. You can only add users of ${currentAdmin.department}`
      );
    }
  }

  let existing = await User.findOne({ usn: faculty_id }); // reuse usn field as faculty id, or add a new field if you prefer

  let photoPath = null;
  if (photo) {
    const entry = findImageEntry(zip, photo);
    if (entry) {
      const ext = path.extname(photo) || ".jpg";
      const fileName = `faculty-${faculty_id}${ext}`;
      const fullPath = path.join(photoDir, fileName);
      fs.writeFileSync(fullPath, entry.getData());
      photoPath = `/uploads/profiles/faculty/${fileName}`;
    } else {
      results.photoMissing.push({ faculty_id, reason: "Photo file not found" });
    }
  }

  const plainPassword = generatePassword();

  if (existing) {
    if (duplicateMode === "skip") {
      results.skipped.push({ faculty_id, reason: "Duplicate faculty_id" });
      return;
    }

    if (duplicateMode === "replace") {
      existing.name = name;
      existing.email = email;
      existing.department = department || existing.department;
      existing.role = "faculty";
      if (photoPath) existing.photo = photoPath;
      existing.password = plainPassword;
      await existing.save();

      try {
        await sendEmail(
          email,
          "Campus Connect faculty account updated",
          `Hi ${name},\n\nYour Campus Connect faculty account details were updated.\n\nEmail: ${email}\nNew Password: ${plainPassword}\n\nRegards,\nCampus Connect`
        );
      } catch (e) {
        console.warn("Email send failed (faculty replace):", e.message);
      }

      results.replaced.push({ faculty_id, email });
      return;
    }
  }

  const user = new User({
    name,
    email,
    role: "faculty",
    department,
    usn: faculty_id, // or a separate field if you add one
    photo: photoPath,
    password: plainPassword,
  });
  await user.save();

  try {
    await sendEmail(
      email,
      "Campus Connect faculty account created",
      `Hi ${name},\n\nYour Campus Connect faculty account has been created.\n\nEmail: ${email}\nPassword: ${plainPassword}\n\nRegards,\nCampus Connect`
    );
  } catch (e) {
    console.warn("Email send failed (faculty create):", e.message);
  }

  results.added.push({ faculty_id, email });
};

// 👑 Admins row (unique by email)
const handleAdminRow = async ({
  row,
  duplicateMode,
  currentAdmin,
  results,
}) => {
  let { name, email, role } = row;

  name = String(name || "").trim();
  email = String(email || "").trim();
  role = String(role || "").trim() || "admin";

  if (!name || !email) {
    throw new Error("Missing required fields (name/email)");
  }

  if (
    !["admin", "superadmin", "department_admin", "functional_admin"].includes(
      role
    )
  ) {
    throw new Error("Invalid admin role");
  }

  let existing = await User.findOne({ email });

  const plainPassword = generatePassword();

  if (existing) {
    if (duplicateMode === "skip") {
      results.skipped.push({ email, reason: "Duplicate email" });
      return;
    }

    if (duplicateMode === "replace") {
      existing.name = name;
      existing.role = role;
      existing.password = plainPassword;
      await existing.save();

      try {
        await sendEmail(
          email,
          "Campus Connect admin account updated",
          `Hi ${name},\n\nYour Campus Connect admin account details were updated.\n\nEmail: ${email}\nNew Password: ${plainPassword}\n\nRegards,\nCampus Connect`
        );
      } catch (e) {
        console.warn("Email send failed (admin replace):", e.message);
      }

      results.replaced.push({ email, role });
      return;
    }
  }

  const user = new User({
    name,
    email,
    role,
    password: plainPassword,
  });
  await user.save();

  try {
    await sendEmail(
      email,
      "Campus Connect admin account created",
      `Hi ${name},\n\nYour Campus Connect admin account has been created.\n\nEmail: ${email}\nPassword: ${plainPassword}\n\nRegards,\nCampus Connect`
    );
  } catch (e) {
    console.warn("Email send failed (admin create):", e.message);
  }

  results.added.push({ email, role });
};

// 🎯 PUBLIC CONTROLLER FUNCTIONS

export const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "ZIP file is required" });
    }

    const { duplicateMode = "skip" } = req.body;

    const results = await processBulkUsers({
      zipFilePath: req.file.path,
      role: "student",
      duplicateMode,
      currentAdmin: req.user,
    });

    return res.json({ success: true, role: "student", results });
  } catch (err) {
    console.error("bulkUploadStudents error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process bulk student upload",
      error: err.message,
    });
  }
};

export const bulkUploadFaculty = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "ZIP file is required" });
    }

    const { duplicateMode = "skip" } = req.body;

    const results = await processBulkUsers({
      zipFilePath: req.file.path,
      role: "faculty",
      duplicateMode,
      currentAdmin: req.user,
    });

    return res.json({ success: true, role: "faculty", results });
  } catch (err) {
    console.error("bulkUploadFaculty error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process bulk faculty upload",
      error: err.message,
    });
  }
};

export const bulkUploadAdmins = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "ZIP file is required" });
    }

    const { duplicateMode = "skip" } = req.body;

    const results = await processBulkUsers({
      zipFilePath: req.file.path,
      role: "admin",
      duplicateMode,
      currentAdmin: req.user,
    });

    return res.json({ success: true, role: "admin", results });
  } catch (err) {
    console.error("bulkUploadAdmins error:", err);
    return res.status(500).json({
      success: false,
      message: "Failed to process bulk admin upload",
      error: err.message,
    });
  }
};
