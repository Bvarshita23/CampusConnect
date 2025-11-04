import mongoose from "mongoose";

const claimRequestSchema = new mongoose.Schema({
  itemId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "LostItem",
    required: true,
  },
  claimantId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  selectedAnswer: { type: String, required: true },
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  createdAt: { type: Date, default: Date.now },
});

export const ClaimRequest = mongoose.model("ClaimRequest", claimRequestSchema);
import { LostItem } from "../models/LostItem.js";
import { ClaimRequest } from "../models/ClaimRequest.js";

export const verifyClaim = async (req, res) => {
  try {
    const { itemId } = req.params;
    const { selectedAnswer } = req.body;
    const claimantId = req.user.id; // from authMiddleware

    const item = await LostItem.findById(itemId).select("+correctAnswer");
    if (!item) return res.status(404).json({ message: "Item not found" });

    const claim = await ClaimRequest.create({
      itemId,
      claimantId,
      selectedAnswer,
    });

    if (selectedAnswer === item.correctAnswer) {
      claim.status = "verified";
      await claim.save();
      item.status = "pending";
      await item.save();

      return res
        .status(200)
        .json({ message: "✅ Answer matched! Sent for admin verification." });
    } else {
      claim.status = "rejected";
      await claim.save();
      return res.status(400).json({ message: "❌ Incorrect answer." });
    }
  } catch (error) {
    console.error("Error verifying claim:", error);
    res.status(500).json({ message: "Server error" });
  }
};
