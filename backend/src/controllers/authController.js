import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import fs from "fs";
import crypto from "crypto";  
import { sendEmail } from "../utils/emailHelper.js"; // ✅ Changed to named import

// 🔹 Step 1: Forgot Password
export const forgotPassword = async (req, res) => {
  const { email } = req.body;

  const user = await User.findOne({ email });
  if (!user)
    return res.status(404).json({ success: false, message: "Email not found" });

  const resetToken = crypto.randomBytes(32).toString("hex");
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpire = Date.now() + 10 * 60 * 1000; // 10 min

  await user.save();

  const resetUrl = `${process.env.FRONTEND_URL}/reset-password/${resetToken}`;

  const htmlContent = `
    <h2>Password Reset Request</h2>
    <p>Click the link below to reset your password:</p>
    <a href="${resetUrl}" style="background-color: #4CAF50; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">Reset Password</a>
    <p>This link expires in 10 minutes.</p>
  `;

  await sendEmail(
    user.email,
    "Password Reset Request",
    `Click the link to reset your password:\n${resetUrl}`,
    htmlContent
  );

  res.json({ success: true, message: "Reset link sent to email" });
};

// 🔹 Step 2: Reset Password
export const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { password } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpire: { $gt: Date.now() },
  });

  if (!user)
    return res
      .status(400)
      .json({ success: false, message: "Invalid or expired token" });

  user.password = password; // your model auto hashes
  user.resetPasswordToken = undefined;
  user.resetPasswordExpire = undefined;

  await user.save();

  res.json({ success: true, message: "Password reset successful" });
};

// ✅ Register User
export const register = async (req, res) => {
  try {
    let { name, email, password, role, department, year, usn } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        success: false,
        message: "Name, email and password are required",
      });
    }

    email = email.toLowerCase().trim();
    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "Email already exists" });
    }

    // 🔹 Normalize USN/FacultyID
    let normalizedUsn = usn ? String(usn).trim().toUpperCase() : "";

    // 🔹 AUTO-DETECT ROLE for student & faculty ONLY
    if (normalizedUsn.startsWith("3BR")) {
      // 🎓 Student USN
      role = "student";
    } else if (
      normalizedUsn.startsWith("CSE") ||
      normalizedUsn.startsWith("AIML") ||
      normalizedUsn.startsWith("CSAI") ||
      normalizedUsn.startsWith("MEC")
    ) {
      // 👩‍🏫 Faculty ID (department prefixes)
      role = "faculty";
    } else {
      // 🔸 For admins: use whatever role superadmin sends in body
      // (admin, superadmin, department_admin, functional_admin)
      // If frontend didn't send role, default to student (optional)
      if (!role) {
        role = "student";
      }
    }

    // 🔹 Build user object safely (avoid empty usn/year saving)
    const userData = {
      name,
      email,
      password,
      role,
    };

    if (department) userData.department = department;
    if (year) userData.year = year;
    if (normalizedUsn) userData.usn = normalizedUsn;

    // Optional: handle photo if you use multer here
    if (req.file) {
      userData.photo = `/uploads/profiles/${req.file.filename}`;
    }

    const user = await User.create(userData);

    // (Optional) remove password before sending back
    const plainUser = user.toObject();
    delete plainUser.password;

    return res.status(201).json({
      success: true,
      message: "User registered successfully",
      user: plainUser,
    });
  } catch (err) {
    console.error("Register error:", err);
    return res
      .status(500)
      .json({ success: false, message: "Server error while registering" });
  }
};

// ✅ Login User
export const loginUser = async (req, res) => {
  try {
    const { email, password, role } = req.body;

    if (!email || !password) {
      return res
        .status(400)
        .json({ success: false, message: "Email and password are required" });
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      console.log("❌ User not found for email:", email);
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Check if user has a password (should always have one, but safety check)
    if (!user.password) {
      console.error("❌ User has no password hash:", user.email);
      return res.status(500).json({
        success: false,
        message: "User account error. Please contact administrator.",
      });
    }

    // Optional: Validate role if provided (for frontend role selection) - Make it a warning, not blocking
    if (role && user.role.toLowerCase() !== role.toLowerCase()) {
      console.log(
        `⚠️ Role mismatch: User is ${user.role}, but selected ${role}`
      );
      // Don't block login, just log it - user might have selected wrong role
    }

    console.log("🔍 Comparing password for user:", user.email);
    const isMatch = await bcrypt.compare(password, user.password);
    console.log("🔐 Password match:", isMatch);
    if (!isMatch) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid credentials" });
    }

    // Check if JWT_SECRET is set
    if (!process.env.JWT_SECRET) {
      console.error("❌ JWT_SECRET is not set in environment variables");
      return res
        .status(500)
        .json({ success: false, message: "Server configuration error" });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
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
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("❌ Login Error:", error);
    console.error("❌ Error Stack:", error.stack);
    res.status(500).json({
      success: false,
      message: "Server error during login",
      error: process.env.NODE_ENV === "development" ? error.message : undefined,
      details: process.env.NODE_ENV === "development" ? error.stack : undefined,
    });
  }
};

// ✅ Get Profile
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update Own Profile Photo
export const updateProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res
        .status(400)
        .json({ success: false, message: "No photo file provided" });
    }

    const user = await User.findById(req.user.id);
    if (!user) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }

    // Delete old photo if exists
    if (user.photo && fs.existsSync(`.${user.photo}`)) {
      fs.unlinkSync(`.${user.photo}`);
    }

    // Update photo path
    const photoPath = `/uploads/profiles/${user.role}s/${req.file.filename}`;
    user.photo = photoPath;
    await user.save();

    res.json({
      success: true,
      message: "Profile photo updated successfully",
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        photo: user.photo,
      },
    });
  } catch (error) {
    console.error("❌ Update photo error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while updating photo" });
  }
};

// ✅ Get All Users
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password");
    res.json({ success: true, users });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Delete User (prevent deleting admin)
export const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (user.role === "admin")
      return res
        .status(403)
        .json({ success: false, message: "Admin cannot be deleted" });

    if (user.photo && fs.existsSync(`.${user.photo}`))
      fs.unlinkSync(`.${user.photo}`);

    await User.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: "User deleted successfully" });
  } catch (error) {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// ✅ Update User
export const updateUser = async (req, res) => {
  try {
    const { name, email, role, department, year, usn } = req.body;
    const photo = req.file
      ? `/uploads/profiles/${role}s/${req.file.filename}`
      : null;

    const user = await User.findById(req.params.id);
    if (!user)
      return res
        .status(404)
        .json({ success: false, message: "User not found" });

    if (photo && user.photo && fs.existsSync(`.${user.photo}`))
      fs.unlinkSync(`.${user.photo}`);

    user.name = name;
    user.email = email;
    user.role = role;
    user.department = department;
    user.year = year;
    user.usn = usn;
    if (photo) user.photo = photo;

    await user.save();
    res.json({ success: true, message: "User updated successfully", user });
  } catch (error) {
    res
      .status(500)
      .json({ success: false, message: "Server error while updating" });
  }
};
