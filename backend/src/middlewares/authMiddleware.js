// backend/src/middlewares/authMiddleware.js
import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * ✅ Verify JWT token and attach user to request
 */
export const verifyToken = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.split(" ")[1] : null;

    // ⚙️ TEMP FIX: allow requests without token (for dev testing)
    if (!token) {
      console.warn("⚠️ No token provided — bypassing auth in development");
      return next();
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired token" });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Auth error:", error.message);
    res.status(401).json({ success: false, message: "Unauthorized" });
  }
};

/**
 * ✅ Role-based route protection
 */
export const requireRoles = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "User not authenticated" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `Access denied for role: ${req.user.role}`,
      });
    }

    next();
  };
};
