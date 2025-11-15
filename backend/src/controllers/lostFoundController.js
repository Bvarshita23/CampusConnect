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

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Unauthorized user" });
    }

    if (!title || !description || !location || !type) {
      return res
        .status(400)
        .json({ success: false, message: "All fields are required" });
    }

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    // Create new item
    const newItem = await LostFound.create({
      title,
      description,
      location,
      type,
      imageUrl,
      postedBy: user._id,
      status: "open",
    });

    // 🔍 Find opposite type items (AI Matching)
    const oppositeType = type === "found" ? "lost" : "found";
    const allOppositeItems = await LostFound.find({
      type: oppositeType,
      status: "open",
    }).populate("postedBy", "name email");

    let bestMatch = null;
    let highestScore = 0;

    for (const item of allOppositeItems) {
      const titleScore = stringSimilarity.compareTwoStrings(
        title.toLowerCase(),
        item.title.toLowerCase()
      );
      const descScore = stringSimilarity.compareTwoStrings(
        description.toLowerCase(),
        item.description.toLowerCase()
      );
      const locScore = stringSimilarity.compareTwoStrings(
        location.toLowerCase(),
        item.location.toLowerCase()
      );

      const finalScore = 0.5 * titleScore + 0.3 * descScore + 0.2 * locScore;

      if (finalScore > highestScore) {
        highestScore = finalScore;
        bestMatch = item;
      }
    }

    // ✅ If similarity > 0.6, mark both as matched and notify
    if (bestMatch && highestScore >= 0.6) {
      newItem.status = "matched";
      bestMatch.status = "matched";
      await newItem.save();
      await bestMatch.save();

      const finder = type === "found" ? user : bestMatch.postedBy;
      const owner = type === "found" ? bestMatch.postedBy : user;

      // Email both parties
      await Promise.all([
        sendEmail(
          owner.email,
          "🎯 Possible Match Found for Your Item",
          `Hi ${owner.name}, we found a potential match for your "${title}". Check Campus Connect Lost & Found for details.`
        ),
        sendEmail(
          finder.email,
          "🎯 Potential Match Found",
          `Hi ${finder.name}, someone reported a similar ${oppositeType} item: "${title}". You might want to verify it.`
        ),
      ]);

      // Create in-app notifications
      await Promise.all([
        createNotification(
          owner._id,
          `📦 Potential match found for "${title}". Check Lost & Found.`
        ),
        createNotification(
          finder._id,
          `📦 Your item "${title}" matched with another user's report.`
        ),
      ]);
    }

    return res.status(201).json({
      success: true,
      message: bestMatch
        ? "Item added successfully — potential match found!"
        : "Item added successfully — no matches found yet.",
      item: newItem,
      match: bestMatch || null,
    });
  } catch (error) {
    console.error("❌ createItem error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error while creating item" });
  }
};

/**
 * ✅ Fetch all items
 */
export const getItems = async (req, res) => {
  try {
    const items = await LostFound.find()
      .populate("postedBy", "name email")
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
 * ✅ Mark Returned
 */
export const markReturned = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFound.findById(id);

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

    res.json({ success: true, message: "Item marked as returned" });
  } catch (error) {
    console.error("markReturned error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to mark item returned" });
  }
};

/**
 * ✅ Delete Item
 */
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const item = await LostFound.findById(id);

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    if (String(item.postedBy) !== String(req.user._id))
      return res
        .status(403)
        .json({ success: false, message: "Not authorized" });

    await item.deleteOne();
    res.json({ success: true, message: "Item deleted successfully" });
  } catch (error) {
    console.error("deleteItem error:", error);
    res.status(500).json({ success: false, message: "Failed to delete item" });
  }
};

/**
 * ✅ Get User History
 */
export const getHistory = async (req, res) => {
  try {
    const userId = req.user._id;
    const items = await LostFound.find({
      $or: [{ postedBy: userId }, { historyOf: userId }],
      status: { $in: ["verified", "matched", "returned"] },
    }).sort({ updatedAt: -1 });
    res.json({ success: true, items });
  } catch (error) {
    console.error("getHistory error:", error);
    res
      .status(500)
      .json({ success: false, message: "Failed to fetch history" });
  }
};
