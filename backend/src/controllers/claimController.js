// src/controllers/claimController.js
import dayjs from "dayjs";
import Claim from "../models/Claim.js";
import LostFound from "../models/LostFound.js";
import { sendEmail } from "../utils/emailHelper.js";

// lockout after wrong answer, in days
const LOCK_DAYS = 7;

const FULL_FILE_URL = (req, relative) =>
  relative ? `${req.protocol}://${req.get("host")}${relative}` : null;

/**
 * Raise a claim on a LostFound item.
 * - If item.type === "found": require selectedAnswer to match item's correctAnswer.
 * - If item.type === "lost": no question is required (the finder is initiating a return).
 *
 * Body: { itemId, selectedAnswer? }
 */
export const raiseClaim = async (req, res) => {
  try {
    const { itemId, selectedAnswer } = req.body;
    if (!itemId)
      return res
        .status(400)
        .json({ success: false, message: "itemId is required" });

    const item = await LostFound.findById(itemId).populate(
      "postedBy",
      "name email"
    );
    if (!item)
      return res
        .status(404)
        .json({ success: false, message: "Item not found" });

    // If claimant recently failed and is locked
    const existingActive = await Claim.findOne({
      item: item._id,
      claimant: req.user._id,
      status: { $in: ["pending", "approved", "pending_handover"] },
    });

    if (
      existingActive?.lockedUntil &&
      dayjs(existingActive.lockedUntil).isAfter(dayjs())
    ) {
      const unlock = dayjs(existingActive.lockedUntil).format(
        "YYYY-MM-DD HH:mm"
      );
      return res.status(429).json({
        success: false,
        message: `You are locked from claiming this item until ${unlock}`,
      });
    }

    // If item already returned/verified, no new claims
    if (["verified", "returned"].includes(item.status)) {
      return res
        .status(400)
        .json({ success: false, message: "Item already verified/returned" });
    }

    // Determine parties
    const claimant = req.user; // the one who is raising the claim
    const counterparty = item.postedBy; // the original poster (lost or found)

    // If it's a found item: require verification question/answer
    if (item.type === "found") {
      // If there is a correctAnswer on item, we must validate
      const hasQuestion = !!item.correctAnswer;
      if (hasQuestion) {
        const userAns = (selectedAnswer || "").trim().toLowerCase();
        const correctAns = (item.correctAnswer || "").trim().toLowerCase();

        // handle wrong answer with lock
        if (!userAns || userAns !== correctAns) {
          // upsert a pending claim to track attempts + lock
          const claim = await Claim.findOneAndUpdate(
            { item: item._id, claimant: claimant._id },
            {
              $inc: { attempts: 1 },
              lockedUntil: dayjs().add(LOCK_DAYS, "day").toDate(),
              counterparty: counterparty._id,
              status: "pending",
              notes: "Wrong answer attempt",
            },
            { new: true, upsert: true }
          );

          return res.status(400).json({
            success: false,
            message:
              "Incorrect verification answer. You are locked for 7 days.",
            attempts: claim.attempts,
          });
        }
      }
    }

    // Create or reuse claim (idempotent for same claimant+item)
    const claim = await Claim.findOneAndUpdate(
      { item: item._id, claimant: claimant._id },
      {
        counterparty: counterparty._id,
        status: item.type === "found" ? "approved" : "approved", // both end in approved
        lockedUntil: null,
        notes:
          item.type === "found"
            ? "Answer correct / approved"
            : "Return initiated for lost item",
      },
      { upsert: true, new: true }
    );

    // Move item to pending handover state
    item.status = "matched"; // keep matched, handover flow is tracked on Claim
    await item.save();

    // Emails
    try {
      const subject = `Claim approved for "${item.title}"`;
      const bodyCounterparty =
        `Hi ${counterparty?.name || "User"},\n\n` +
        `${claimant?.name || "A user"} has raised a ${
          item.type === "found" ? "claim" : "return"
        } for "${item.title}".\n` +
        `Please coordinate handover. You will both need to upload proof of return to mark it completed.\n\n` +
        `— Campus Connect Lost & Found`;

      const bodyClaimant =
        `Hi ${claimant?.name || "User"},\n\n` +
        `Your ${item.type === "found" ? "claim" : "return"} for "${
          item.title
        }" has been approved.\n` +
        `Please meet the other party and upload proof of handover. Once both parties upload proof, this will be marked as Returned.\n\n` +
        `— Campus Connect Lost & Found`;

      if (counterparty?.email)
        await sendEmail(counterparty.email, subject, bodyCounterparty);
      if (claimant?.email)
        await sendEmail(claimant.email, subject, bodyClaimant);
    } catch (e) {
      console.warn("Email send failed (non-blocking):", e.message);
    }

    return res.json({
      success: true,
      message: "Claim approved. Awaiting handover and proof from both parties.",
      claim,
    });
  } catch (err) {
    console.error("raiseClaim error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

/**
 * Upload handover image proof by either party.
 * Field name: "photo"
 */
export const uploadProof = async (req, res) => {
  try {
    const { id } = req.params; // claim id
    const claim = await Claim.findById(id).populate([
      { path: "item", select: "title status postedBy type" },
      { path: "claimant", select: "name email" },
      { path: "counterparty", select: "name email" },
    ]);

    if (!claim)
      return res
        .status(404)
        .json({ success: false, message: "Claim not found" });

    // Only claimant or counterparty can upload
    const uid = String(req.user._id);
    const isClaimant = String(claim.claimant._id) === uid;
    const isCounterparty = String(claim.counterparty._id) === uid;
    if (!isClaimant && !isCounterparty) {
      return res.status(403).json({ success: false, message: "Not allowed" });
    }

    const fileRel = req.file
      ? `/uploads/claim-proofs/${req.file.filename}`
      : null;
    if (!fileRel)
      return res
        .status(400)
        .json({ success: false, message: "No file received" });

    if (isClaimant) claim.imageProof.claimant = fileRel;
    if (isCounterparty) claim.imageProof.counterparty = fileRel;

    // Once both proofs exist -> mark returned
    let finished = false;
    if (claim.imageProof.claimant && claim.imageProof.counterparty) {
      claim.status = "returned";
      finished = true;
    } else {
      // ensure we reflect the stage
      claim.status = "pending_handover";
    }

    await claim.save();

    // If finished, mark item.status = "returned"
    if (finished) {
      const item = await LostFound.findById(claim.item._id);
      if (item) {
        item.status = "returned";
        if (!Array.isArray(item.historyOf)) item.historyOf = [];
        // audit both
        item.historyOf.push(claim.claimant._id);
        item.historyOf.push(claim.counterparty._id);
        await item.save();
      }

      // notify both
      try {
        const subject = `✅ Return confirmed for "${claim.item.title}"`;
        const body =
          `Hello,\n\nBoth parties uploaded return proof for "${claim.item.title}". This item is now marked as Returned.\n\n` +
          `— Campus Connect Lost & Found`;

        if (claim.claimant?.email)
          await sendEmail(claim.claimant.email, subject, body);
        if (claim.counterparty?.email)
          await sendEmail(claim.counterparty.email, subject, body);
      } catch (e) {
        console.warn("Email send failed (non-blocking):", e.message);
      }
    }

    return res.json({
      success: true,
      message: finished
        ? "Both proofs received. Marked as Returned."
        : "Proof uploaded. Waiting for the other party.",
      proof: {
        claimant: FULL_FILE_URL(req, claim.imageProof.claimant),
        counterparty: FULL_FILE_URL(req, claim.imageProof.counterparty),
      },
      status: claim.status,
    });
  } catch (err) {
    console.error("uploadProof error:", err);
    return res.status(500).json({ success: false, message: "Server error" });
  }
};

// Fetch my claims
export const myClaims = async (req, res) => {
  try {
    const claims = await Claim.find({
      $or: [{ claimant: req.user._id }, { counterparty: req.user._id }],
    })
      .populate("item", "title type status imageUrl location")
      .sort({ updatedAt: -1 });

    res.json({ success: true, claims });
  } catch (err) {
    console.error("myClaims error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// Admin/all claims (optional)
export const allClaims = async (_req, res) => {
  try {
    const claims = await Claim.find()
      .populate("item", "title type status")
      .populate("claimant", "name email")
      .populate("counterparty", "name email")
      .sort({ updatedAt: -1 });
    res.json({ success: true, claims });
  } catch (err) {
    console.error("allClaims error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
