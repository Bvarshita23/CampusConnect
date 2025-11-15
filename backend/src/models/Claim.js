// src/models/Claim.js
import mongoose from "mongoose";

const claimSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostFound",
      required: true,
      index: true,
    },

    // Who raised the claim (the person asserting ownership or initiating return)
    claimant: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // Usually the original poster of the item (who reported lost/found)
    counterparty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    // status flow:
    // "pending" -> (for found-item claim needs correct answer or admin review)
    // "approved" -> (question passed/accepted)
    // "pending_handover" -> (waiting for physical exchange)
    // "returned" -> (BOTH uploaded proof)
    // "rejected" / "expired"
    status: {
      type: String,
      enum: [
        "pending",
        "approved",
        "pending_handover",
        "returned",
        "rejected",
        "expired",
      ],
      default: "pending",
      index: true,
    },

    // Security / throttle: wrong answers, cooldowns, etc.
    attempts: { type: Number, default: 0 },
    lockedUntil: { type: Date }, // if wrong answer -> lock claimant until this time

    // Handover confirmations via image proof
    imageProof: {
      claimant: { type: String }, // /uploads/claim-proofs/...
      counterparty: { type: String }, // /uploads/claim-proofs/...
    },

    // Optional audit notes
    notes: { type: String },
  },
  { timestamps: true }
);

export default mongoose.model("Claim", claimSchema);
