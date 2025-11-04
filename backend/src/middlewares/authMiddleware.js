import jwt from "jsonwebtoken";
import User from "../models/User.js";

/**
 * ✅ Middleware: Verifies JWT and attaches user info to request
 *    - Extracts token from Authorization header
 *    - Decodes JWT and fetches user from DB
 *    - Attaches user object to req.user for use in controllers
 */
export const authRequired = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    // No token found
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        success: false,
        message: "No token provided. Access denied.",
      });
    }

    // Verify token
    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "campusconnectsecret"
    );

    // Fetch user from DB
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or deleted.",
      });
    }

    // Attach user info
    req.user = {
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department || null,
    };

    next();
  } catch (err) {
    console.error("❌ authRequired error:", err.message);
    return res.status(401).json({
      success: false,
      message: "Invalid or expired token. Please log in again.",
    });
  }
};

/**
 * ✅ Backward-compatible alias
 * Some files may still use 'authGuard' instead of 'authRequired'
 */
export const authGuard = authRequired;

/**
 * ✅ Role-based access restriction middleware
 * Usage example:
 *   router.post("/admin-only", requireRole(["admin"]), controllerFunc);
 */
export const requireRole = (roles = []) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: "Access denied. Insufficient permissions.",
      });
    }
    next();
  };
};
