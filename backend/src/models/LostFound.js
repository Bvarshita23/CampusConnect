import mongoose from "mongoose";

const claimSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  selectedAnswer: String,
  status: {
    type: String,
    enum: ["pending", "verified", "rejected"],
    default: "pending",
  },
  decidedAt: Date,
});

const lostFoundSchema = new mongoose.Schema(
  {
    type: { type: String, enum: ["lost", "found"], required: true },
    title: { type: String, required: true },
    description: String,
    location: String,
    imageUrl: String,

    // Ownership verification
    uniqueQuestion: String,
    options: [String],
    correctAnswer: { type: String, select: false },

    // Relations
    postedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    matchedWith: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LostFound",
      default: null,
    },
    claimedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    claimedAt: { type: Date },
    failedAttempts: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    // Lifecycle status
    status: {
      type: String,
      enum: ["waiting", "matched", "verified", "rejected", "closed"],
      default: "waiting",
    },

    claims: [claimSchema],
  },
  { timestamps: true }
);

const LostFound = mongoose.model("LostFound", lostFoundSchema);
export default LostFound;
