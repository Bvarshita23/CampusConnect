import LostFound from "../models/LostFound.js";
import { sendEmail } from "../utils/emailHelper.js";
import stringSimilarity from "string-similarity";
import { createNotification } from "./notificationController.js";

/**
 * ✅ Create Lost/Found item + AI Smart Match
 */
export const createItem = async (req, res) => {
  try {
    const { type, title, description, location } = req.body;
    const user = req.user;

    if (!user)
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user" });

    if (!title || !description || !location || !type)
      return res
        .status(400)
        .json({ success: false, message: "All fields required" });

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    const newItem = await LostFound.create({
      title,
      description,
      location,
      type,
      imageUrl,
      postedBy: user._id,
      department: user.department, // IMPORTANT for admin filtering
      status: "open",
    });

    return res.status(201).json({
      success: true,
      message: "Item added",
      item: newItem,
    });
  } catch (error) {
    console.error("createItem error:", error);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * GET All Items
 */
export const getItems = async (req, res) => {
  try {
    const items = await LostFound.find()
      .populate("postedBy", "name email role department")
      .sort({ createdAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error("getItems error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch items" });
  }
};
/**
 * ✅ Verify Claim
 */
/**
 * ✅ Verify Claim with Security Question + Weekly Lockout
 */
export const verifyClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedAnswer } = req.body;
    const user = req.user;

    const item = await LostFound.findById(id)
      .select("+correctAnswer uniqueQuestion postedBy")
      .populate("postedBy", "name email");

    if (!item) {
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });
    }

    // 🔒 Prevent repeat claim within 7 days
    const lockKey = `claim_lock_${user._id}`;
    if (!global.lockedUsers) global.lockedUsers = new Map();

    const lockedUntil = global.lockedUsers.get(lockKey);
    if (lockedUntil && Date.now() < lockedUntil) {
      const remaining = Math.ceil(
        (lockedUntil - Date.now()) / (1000 * 60 * 60 * 24)
      );
      return res.status(403).json({
        success: false,
        message: `You can retry claiming after ${remaining} day(s).`,
      });
    }

    const userAns = (selectedAnswer || "").trim().toLowerCase();
    const correctAns = (item.correctAnswer || "").trim().toLowerCase();

    // ❌ Wrong answer — apply 1-week lockout
    if (userAns !== correctAns) {
      global.lockedUsers.set(lockKey, Date.now() + 7 * 24 * 60 * 60 * 1000);
      return res.status(400).json({
        success: false,
        message: "Incorrect answer. You are locked from claiming for 7 days.",
      });
    }

    // ✅ Correct answer: mark verified + email both parties
    item.status = "verified";
    if (!Array.isArray(item.historyOf)) item.historyOf = [];
    item.historyOf.push(user._id);
    await item.save();

    // Notify both users
    try {
      await Promise.all([
        sendEmail(
          item.postedBy.email,
          "✅ Your found item has been claimed!",
          `Hi ${item.postedBy.name}, ${user.name} correctly answered your verification question for "${item.title}".`
        ),
        sendEmail(
          user.email,
          "🎉 Claim verified!",
          `Hi ${user.name}, your claim for "${item.title}" has been verified successfully.`
        ),
      ]);
    } catch (e) {
      console.warn("Email send failed:", e.message);
    }

    return res.json({
      success: true,
      message: "✅ Claim verified successfully!",
    });
  } catch (e) {
    console.error("verifyClaim error:", e);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * MARK Returned
 */
export const markReturned = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id);
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    if (String(item.postedBy) !== String(req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    item.status = "returned";
    await item.save();

    res.json({ success: true, message: "Item marked returned" });
  } catch (error) {
    console.error("markReturned error:", error);
    res.status(500).json({ success: false, message: "Failed" });
  }
};

/**
 * DELETE Item — updated with superadmin / department admin / functional admin logic
 */
export const deleteItem = async (req, res) => {
  try {
    const item = await LostFound.findById(req.params.id).populate(
      "postedBy",
      "department"
    );

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    const role = req.user.role;
    const userDept = req.user.department;

    // SUPERADMIN CAN DELETE ANYTHING
    if (role === "superadmin") {
      await item.deleteOne();
      return res.json({ success: true, message: "Deleted successfully" });
    }

    // DEPARTMENT ADMIN → Only same department
    if (role === "department_admin") {
      if (item.postedBy?.department !== userDept) {
        return res.status(403).json({
          success: false,
          message: "Access denied – This item is not from your department",
        });
      }
      await item.deleteOne();
      return res.json({ success: true, message: "Deleted successfully" });
    }

    // FUNCTIONAL ADMIN → Only delete lost/found items from their selected category (optional)
    if (role === "functional_admin") {
      // If you have categories, check here
      return res.status(403).json({
        success: false,
        message: "Functional admin restricted — no delete permissions here",
      });
    }

    // Normal users — only delete their own
    if (String(item.postedBy._id) !== String(req.user._id)) {
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });
    }

    await item.deleteOne();
    res.json({ success: true, message: "Deleted successfully" });
  } catch (error) {
    console.error("deleteItem error:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};

/**
 * HISTORY
 */
export const getHistory = async (req, res) => {
  try {
    const items = await LostFound.find({
      $or: [{ postedBy: req.user._id }, { historyOf: req.user._id }],
      status: { $in: ["verified", "matched", "returned"] },
    }).sort({ updatedAt: -1 });

    res.json({ success: true, items });
  } catch (error) {
    console.error("getHistory error:", error);
    res.status(500).json({ success: false, message: "Failed to fetch" });
  }
};
