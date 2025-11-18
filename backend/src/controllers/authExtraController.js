import User from "../models/User.js";

/**
 * 🔍 Check if email exists for login validation
 */
export const checkEmail = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({ success: true, exists: false });
    }

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
