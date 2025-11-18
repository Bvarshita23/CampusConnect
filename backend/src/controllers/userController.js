// backend/src/controllers/userController.js
import User from "../models/User.js";

/**
 * ✅ Create a single user (used by superadmin/admin panels if needed)
 */
export const createUser = async (req, res) => {
  try {
    const { name, email, password, role, department, year, usn } = req.body;

    const existing = await User.findOne({ email });
    if (existing) {
      return res
        .status(400)
        .json({ success: false, message: "User already exists" });
    }

    const user = await User.create({
      name,
      email,
      password,
      role,
      department,
      year,
      usn,
    });

    const plain = user.toObject();
    delete plain.password;

    res.status(201).json({ success: true, user: plain });
  } catch (err) {
    console.error("Create user error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while creating user" });
  }
};

/**
 * ✅ List users with filters and role-based restrictions
 * Query params:
 *   ?role=student / faculty / admin / ...
 *   ?department=CSE
 */
export const listUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    const query = {};

    if (role) query.role = role;
    if (department) query.department = department;

    // Department admin can ONLY see their own department
    if (req.user?.role === "department_admin" && req.user.department) {
      query.department = req.user.department;
    }

    const users = await User.find(query).select("-password");

    res.json({ success: true, users });
  } catch (err) {
    console.error("List users error:", err);
    res
      .status(500)
      .json({ success: false, message: "Server error while listing users" });
  }
};
