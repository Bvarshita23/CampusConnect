import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fs from "fs";
import { sendEmail } from "../utils/emailHelper.js";
import xlsx from "xlsx";
import crypto from "crypto";
import path from "path";
import AdmZip from "adm-zip";
/* ---------------------------------------------
   PASSWORD RESET – Step 1
---------------------------------------------- */
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(200).json({
      success: true,
      message: "If this email exists, password reset link sent",
    });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000;
  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  await sendEmail(user.email, "Password Reset", resetUrl);

  res.json({ success: true, message: "Reset link sent" });
};

/* ---------------------------------------------
   PASSWORD RESET – Step 2
---------------------------------------------- */
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const strongPasswordRegex =
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!#%*?&])[A-Za-z\d@$!#%*?&]{8,}$/;

  if (!strongPasswordRegex.test(password)) {
    return res.status(400).json({
      success: false,
      message:
        "Weak password — must contain upper/lowercase, number & special char",
    });
  }

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });

  user.password = password;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ success: true, message: "Password reset successful" });
};

/* ---------------------------------------------
   REGISTER USER
---------------------------------------------- */
function generatePassword() {
  const length = 8;
  const chars =
    "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  let pwd = "";
  for (let i = 0; i < length; i++) {
    pwd += chars[Math.floor(Math.random() * chars.length)];
  }
  return pwd;
}

/* ---------------------------------------------
   REGISTER USER
---------------------------------------------- */
export const register = async (req, res) => {
  try {
    let { name, email, role, department, year, usn } = req.body;

    if (!name || !email)
      return res.status(400).json({
        success: false,
        message: "Name and email are required",
      });

    email = email.toLowerCase().trim();

    const existing = await User.findOne({ email });
    if (existing)
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });

    // Generate auto random password
    const autoPassword = generatePassword();

    // Normalize USN
    let normalizedUsn = usn ? String(usn).trim().toUpperCase() : "";

    // Auto-detect student or faculty
    if (normalizedUsn.startsWith("3BR")) role = "student";
    else if (
      normalizedUsn.startsWith("CSE") ||
      normalizedUsn.startsWith("AIML") ||
      normalizedUsn.startsWith("CSAI") ||
      normalizedUsn.startsWith("MEC")
    )
      role = "faculty";

    // Build user object
    const userData = {
      name,
      email,
      password: autoPassword,
      role,
    };

    if (department) userData.department = department;
    if (year) userData.year = year;
    if (normalizedUsn) userData.usn = normalizedUsn;
    if (req.file) {
      const result = await uploadBufferToCloudinary(
        req.file.buffer,
        "campusconnect/users"
      );
      userData.photo = result.secure_url; // cloudinary URL
    }

    const user = await User.create(userData);

    // HTML email message
    const htmlMessage = `
<h2 style="color:#2563eb;">Welcome to CampusConnect 🎉</h2>

<p>Hi <strong>${name}</strong>,</p>

<p>Your account has been successfully created. Here are your login details:</p>

<table style="padding:12px;border:1px solid #ddd;border-radius:8px;">
  <tr><td><strong>Email:</strong></td><td>${email}</td></tr>
  <tr><td><strong>Password:</strong></td><td>${autoPassword}</td></tr>
  <tr><td><strong>Role:</strong></td><td>${role}</td></tr>
</table>

<p>You can now log in to the portal.</p>

<p style="margin-top:12px;color:#666;">Regards,<br>CampusConnect Team</p>
`;

    try {
      await sendEmail(email, "Your CampusConnect Login Details", htmlMessage);
      console.log("📌 Email sent successfully");
    } catch (e) {
      console.log("❌ Failed to send email:", e.message);
    }

    const safeUser = user.toObject();
    delete safeUser.password;

    res.status(201).json({
      success: true,
      message: "User registered & password emailed",
      emailSent: true,
      user: safeUser,
    });
  } catch (err) {
    console.log("Register error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

/* ---------------------------------------------
   LOGIN
---------------------------------------------- */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    const genericError = {
      success: false,
      message: "User not found",
    };

    if (!email || !password) return res.status(404).json(genericError);

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) return res.status(404).json(genericError);

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(404).json(genericError);

    const token = jwt.sign(
      { id: user._id, role: user.role, department: user.department },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.json({
      success: true,
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        department: user.department,
        year: user.year,
        usn: user.usn,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
/* ---------------------------------------------
   GET PROFILE
---------------------------------------------- */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------
   UPDATE PROFILE PHOTO
---------------------------------------------- */
export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: "No photo file" });

    const user = await User.findById(req.user.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.photo && fs.existsSync(`.${user.photo}`))
      fs.unlinkSync(`.${user.photo}`);

    user.photo = `/uploads/profiles/${user.role}s/${req.file.filename}`;
    await user.save();

    res.json({
      success: true,
      message: "Photo updated",
      user,
    });
  } catch (err) {
    console.log("Photo update error", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------
   GET ALL USERS
---------------------------------------------- */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------
   DELETE USER
---------------------------------------------- */
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.photo && fs.existsSync(`.${user.photo}`))
      fs.unlinkSync(`.${user.photo}`);

    await user.deleteOne();

    res.json({ success: true, message: "User deleted" });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------
   UPDATE USER
---------------------------------------------- */
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, year, usn } = req.body;

    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    user.name = name;
    user.email = email;
    user.role = role;
    user.department = department;
    user.year = year;
    user.usn = usn;

    await user.save();

    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error while updating" });
  }
};
/* ---------------------------------------------
   EXCEL PARSER
---------------------------------------------- */
const parseExcelFile = (filePath) => {
  const workbook = xlsx.readFile(filePath);
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  return xlsx.utils.sheet_to_json(sheet, { defval: "" });
};

/* ---------------------------------------------
   BULK UPLOAD – STUDENTS (FIXED FOR ZIP)
---------------------------------------------- */
/* ---------------------------------------------
   BULK UPLOAD – STUDENTS (ZIP, Excel Only)
---------------------------------------------- */
export const bulkUploadStudents = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Zip file is required" });
    }

    const zipPath = req.file.path;
    const extractDir = path.join("uploads", "extracted", Date.now().toString());

    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    // Extract ZIP
    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    // Find Excel file
    const files = fs.readdirSync(extractDir);
    const excelFile = files.find(
      (f) => f.endsWith(".xlsx") || f.endsWith(".xls")
    );

    if (!excelFile) {
      return res.status(400).json({
        success: false,
        message: "No Excel file found inside ZIP",
      });
    }

    const rows = parseExcelFile(path.join(extractDir, excelFile));

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let errors = 0;

    for (const row of rows) {
      const name = row.name || row.Name || "";
      const email = row.email || row.Email || "";
      const usn = (row.usn || row.USN || "").toUpperCase();
      const department = row.department || row.Department || "";
      const year = row.year || row.Year || "";

      if (!name || !email || !usn) {
        skipped++;
        continue;
      }

      try {
        let user = await User.findOne({ usn });

        if (user) {
          user.name = name;
          user.email = email;
          user.department = department;
          user.year = year;
          user.role = "student";
          await user.save();
          updated++;
        } else {
          const password = generatePassword();
          const hashedPassword = await bcrypt.hash(password, 10);

          await User.create({
            name,
            email,
            usn,
            department,
            year,
            role: "student",
            password: hashedPassword,
          });

          added++;
        }
      } catch (err) {
        errors++;
      }
    }

    // cleanup
    fs.rmSync(extractDir, { recursive: true });
    fs.unlinkSync(zipPath);

    return res.json({
      success: true,
      message: "Student bulk upload completed",
      summary: { added, updated, skipped, errors },
    });
  } catch (err) {
    console.error("Student bulk upload error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during student bulk upload",
    });
  }
};
/* ---------------------------------------------
   BULK UPLOAD – FACULTY (Excel Only)
---------------------------------------------- */
export const bulkUploadFaculty = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Zip file is required" });
    }

    const zipPath = req.file.path;
    const extractDir = path.join("uploads", "extracted", Date.now().toString());

    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    const files = fs.readdirSync(extractDir);
    const excelFile = files.find(
      (f) => f.endsWith(".xlsx") || f.endsWith(".xls")
    );

    if (!excelFile) {
      return res.status(400).json({
        success: false,
        message: "No Excel file found in ZIP",
      });
    }

    const rows = parseExcelFile(path.join(extractDir, excelFile));

    let added = 0,
      updated = 0,
      skipped = 0,
      errors = 0;

    for (const row of rows) {
      const name = row.name || "";
      const email = row.email || "";
      const facultyId = (row.usn || row.facultyId || "").toUpperCase();
      const department = row.department || "";

      if (!name || !email || !facultyId) {
        skipped++;
        continue;
      }

      try {
        let user = await User.findOne({ usn: facultyId });

        if (user) {
          user.name = name;
          user.email = email;
          user.department = department;
          user.role = "faculty";
          await user.save();
          updated++;
        } else {
          await User.create({
            name,
            email,
            usn: facultyId,
            department,
            role: "faculty",
            password: facultyId,
          });

          added++;
        }
      } catch (err) {
        errors++;
      }
    }

    fs.rmSync(extractDir, { recursive: true });
    fs.unlinkSync(zipPath);

    return res.json({
      success: true,
      message: "Faculty bulk upload completed",
      summary: { added, updated, skipped, errors },
    });
  } catch (err) {
    console.error("Faculty bulk upload error:", err);
    return res.status(500).json({
      success: false,
      message: "Server error during faculty upload",
    });
  }
};

/* ---------------------------------------------
   BULK UPLOAD – ADMINS (Excel Only)
---------------------------------------------- */
export const bulkUploadAdmins = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "Zip file is required" });
    }

    const zipPath = req.file.path;
    const extractDir = path.join("uploads", "extracted", Date.now().toString());

    if (!fs.existsSync(extractDir)) {
      fs.mkdirSync(extractDir, { recursive: true });
    }

    const zip = new AdmZip(zipPath);
    zip.extractAllTo(extractDir, true);

    const files = fs.readdirSync(extractDir);
    const excelFile = files.find(
      (f) => f.endsWith(".xlsx") || f.endsWith(".xls")
    );

    if (!excelFile) {
      return res.status(400).json({
        success: false,
        message: "No Excel file found in ZIP",
      });
    }

    const rows = parseExcelFile(path.join(extractDir, excelFile));

    let added = 0,
      updated = 0,
      skipped = 0,
      errors = 0;

    for (const row of rows) {
      const name = row.name || "";
      const email = row.email || "";
      const role = (row.role || "").toLowerCase();
      const department = row.department || "";

      if (!name || !email || !role) {
        skipped++;
        continue;
      }

      if (
        ![
          "admin",
          "superadmin",
          "department_admin",
          "functional_admin",
        ].includes(role)
      ) {
        skipped++;
        continue;
      }

      try {
        let user = await User.findOne({ email });

        if (user) {
          user.name = name;
          user.role = role;
          user.department = department;
          await user.save();
          updated++;
        } else {
          await User.create({
            name,
            email,
            role,
            department,
            password: email,
          });

          added++;
        }
      } catch (err) {
        errors++;
      }
    }

    fs.rmSync(extractDir, { recursive: true });
    fs.unlinkSync(zipPath);

    return res.json({
      success: true,
      message: "Admin bulk upload completed",
      summary: { added, updated, skipped, errors },
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error during admin upload",
    });
  }
};

/* ---------------------------------------------
   CHECK PORT
---------------------------------------------- */
export const checkPort = async (req, res) => {
  try {
    const { exec } = await import("child_process");

    exec("netstat -ano | findstr :8080", (err, stdout) => {
      const used = stdout.trim() !== "";
      res.json({
        success: true,
        message: `Port 8080 is ${used ? "in use" : "available"}`,
        inUse: used,
      });
    });
  } catch (err) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/* ---------------------------------------------
   BULK UPLOAD – STUDENTS (FORM-DATA)
---------------------------------------------- */
export const bulkUploadStudentsForm = async (req, res) => {
  try {
    if (!req.files?.file)
      return res
        .status(400)
        .json({ success: false, message: "Excel file required" });

    const excelFile = req.files.file[0];
    const rows = parseExcelFile(excelFile.path);

    let added = 0,
      updated = 0,
      skipped = 0,
      errors = 0;

    for (const row of rows) {
      const name =
        row.name || row.Name || row.NAME || row.fullname || row.FullName;
      const email = row.email || row.Email || row.EMAIL;
      const usn = (row.usn || row.USN || row.Usn || "").toUpperCase();
      const department =
        row.department || row.Department || row.DEPT || row.dept;
      const year = row.year || row.Year || row.YEAR;

      if (!name || !email || !usn) {
        skipped++;
        continue;
      }

      try {
        let user = await User.findOne({ usn });

        if (user) {
          if (name) user.name = name;
          if (email) user.email = email;
          if (department) user.department = department;
          if (year) user.year = year;
          user.role = "student";
          await user.save();
          updated++;
        } else {
          const randomPassword = generatePassword();
          const hashedPassword = await bcrypt.hash(randomPassword, 10);

          await User.create({
            name,
            email,
            password: hashedPassword,
            role: "student",
            department,
            year,
            usn,
          });

          try {
            await sendEmail(
              email,
              "Your CampusConnect Student Account",
              `Hello ${name},\n\nYour account created.\nEmail: ${email}\nPassword: ${randomPassword}\n\n– CampusConnect`
            );
          } catch (e) {
            console.error("Email failed:", e.message);
          }

          added++;
        }
      } catch (err) {
        console.error("Student bulk error:", err.message);
        errors++;
      }
    }

    return res.json({
      success: true,
      message: "Student bulk upload completed",
      summary: { added, updated, skipped, errors },
    });
  } catch (error) {
    console.error("Bulk upload error:", error.message);
    return res
      .status(500)
      .json({ success: false, message: error.message || "Server error" });
  }
};
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) return res.status(400).json({ success: false, exists: false });

    const user = await User.findOne({ email: email.toLowerCase().trim() });

    return res.json({
      success: true,
      exists: !!user,
    });
  } catch (err) {
    console.error("checkEmail error:", err);
    return res.json({ success: false, exists: false });
  }
};
