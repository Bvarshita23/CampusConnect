import LostFound from "../models/LostFound.js";
import { sendEmail } from "../utils/emailHelper.js";
import stringSimilarity from "string-similarity";

/**
 * 🧩 Create new Lost/Found item
 */
export const createItem = async (req, res) => {
  try {
    const {
      type,
      title,
      description,
      location,
      uniqueQuestion,
      options,
      correctAnswer,
    } = req.body;

    const imageUrl = req.file ? `/uploads/${req.file.filename}` : null;

    let normalizedOptions = options;
    try {
      if (typeof options === "string") normalizedOptions = JSON.parse(options);
    } catch {
      normalizedOptions = [];
    }

    const item = await LostFound.create({
      type,
      title,
      description,
      location,
      imageUrl,
      postedBy: req.user._id,
      uniqueQuestion,
      options: Array.isArray(normalizedOptions) ? normalizedOptions : [],
      correctAnswer,
      status: "available",
    });

    // 🔍 Auto-match (lost ↔ found)
    const oppositeType = type === "found" ? "lost" : "found";
    const candidates = await LostFound.find({ type: oppositeType }).populate(
      "postedBy",
      "name email"
    );

    let bestMatch = null;
    let bestScore = 0;

    for (const c of candidates) {
      const score =
        (stringSimilarity.compareTwoStrings(
          (title || "").toLowerCase(),
          (c.title || "").toLowerCase()
        ) +
          stringSimilarity.compareTwoStrings(
            (description || "").toLowerCase(),
            (c.description || "").toLowerCase()
          )) /
        2;
      if (score > bestScore) {
        bestScore = score;
        bestMatch = c;
      }
    }

    // 🎯 Notify on strong match
    if (bestMatch && bestScore >= 0.6) {
      const finder = type === "found" ? req.user : bestMatch.postedBy;
      const owner = type === "found" ? bestMatch.postedBy : req.user;

      try {
        await sendEmail(
          owner.email,
          "🎯 Match Found",
          `We found a possible match for "${title}". Check Campus Connect.`
        );
        await sendEmail(
          finder.email,
          "🎯 Match Found",
          `Someone might be the owner of "${title}". Check Campus Connect.`
        );
      } catch (e) {
        console.log("⚠️ Email failed (ignored):", e.message);
      }

      item.status = "matched";
      bestMatch.status = "matched";
      await item.save();
      await bestMatch.save();
    }

    res.status(201).json({ success: true, item, message: "Item created" });
  } catch (e) {
    console.error("❌ Error creating item:", e);
    res.status(500).json({ success: false, message: "Create failed" });
  }
};

/**
 * 🧾 Fetch items (with optional ?type=found|lost and ?search=)
 * Excludes claimed/returned items
 */
export const getItems = async (req, res) => {
  try {
    const { type, search } = req.query;
    const q = {
      status: { $nin: ["claimed", "returned"] },
    };
    if (type) q.type = type;
    if (search) {
      q.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { location: { $regex: search, $options: "i" } },
      ];
    }

    const items = await LostFound.find(q)
      .populate("postedBy", "_id") // hide identity
      .sort({ createdAt: -1 });

    res.json({ success: true, items });
  } catch (e) {
    console.error("❌ Fetch failed:", e);
    res.status(500).json({ success: false, message: "Fetch failed" });
  }
};

/**
 * 🧩 Verify ownership (for FOUND items)
 */
export const verifyClaim = async (req, res) => {
  try {
    const { id } = req.params;
    const { selectedAnswer } = req.body;

    if (!selectedAnswer || !selectedAnswer.trim()) {
      return res.status(400).json({
        success: false,
        message: "Please select an answer.",
      });
    }

    const item = await LostFound.findById(id)
      .select("+correctAnswer")
      .populate("postedBy", "name email");

    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    if (!item.uniqueQuestion || !item.correctAnswer)
      return res.status(400).json({
        success: false,
        message: "This item does not require verification.",
      });

    // ⛔ Check if this user already failed before
    if (item.failedAttempts?.includes(req.user._id)) {
      return res.status(403).json({
        success: false,
        message: "You already attempted verification. Access denied.",
      });
    }

    const userAnswer = selectedAnswer.trim().toLowerCase();
    const correctAnswer = item.correctAnswer.trim().toLowerCase();
    const isCorrect = userAnswer === correctAnswer;

    if (!isCorrect) {
      item.status = "rejected";
      item.failedAttempts = [...(item.failedAttempts || []), req.user._id];
      await item.save();
      return res.status(400).json({
        success: false,
        message: "❌ Incorrect answer. Claim rejected permanently.",
      });
    }

    // ✅ Verified successfully
    item.status = "claimed";
    item.claimedBy = req.user._id;
    item.claimedAt = new Date();
    await item.save();

    const finder = item.postedBy;
    const owner = req.user;

    // Send notification emails
    try {
      if (finder?.email && owner?.email) {
        await sendEmail(
          owner.email,
          "🎉 Ownership Verified",
          `Hi ${owner.name}, your claim for "${item.title}" was verified successfully and moved to your history.`
        );
        await sendEmail(
          finder.email,
          "🎉 Item Claimed Successfully",
          `Hi ${finder.name}, your found item "${item.title}" has been successfully claimed and moved to your history.`
        );
      }
    } catch (e) {
      console.log("⚠️ Email send failed (ignored):", e.message);
    }

    return res.json({
      success: true,
      message: "✅ Ownership verified. Item moved to history.",
    });
  } catch (err) {
    console.error("❌ Error verifying claim:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * 🗑️ Delete (only by owner)
 */
export const deleteItem = async (req, res) => {
  try {
    const { id } = req.params;
    const doc = await LostFound.findById(id);
    if (!doc)
      return res.status(404).json({ success: false, message: "Not found" });
    if (String(doc.postedBy) !== String(req.user._id))
      return res.status(403).json({ success: false, message: "Not your item" });

    await doc.deleteOne();
    res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error("❌ Delete failed:", e);
    res.status(500).json({ success: false, message: "Delete failed" });
  }
};

/**
 * 🕓 Get user history (claimed & returned)
 */
export const getHistory = async (req, res) => {
  try {
    const items = await LostFound.find({
      $or: [{ postedBy: req.user._id }, { claimedBy: req.user._id }],
      status: { $in: ["claimed", "returned"] },
    })
      .populate("postedBy claimedBy", "name email")
      .sort({ claimedAt: -1 });

    res.json({ success: true, items });
  } catch (e) {
    console.error("❌ History fetch failed:", e);
    res.status(500).json({ success: false, message: "History fetch failed" });
  }
};
