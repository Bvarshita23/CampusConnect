import mongoose from "mongoose";

const lostFoundSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    location: { type: String, required: true },

    imageUrl: { type: String }, // ✅ for uploaded photo path

    type: {
      type: String,
      enum: ["lost", "found"],
      required: true,
    },

    status: {
      type: String,
      enum: ["open", "matched", "verified", "returned", "rejected"],
      default: "open",
    },

    postedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    historyOf: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    correctAnswer: { type: String },
    uniqueQuestion: { type: String },
    options: [{ type: String }],
  },
  { timestamps: true }
);

export default mongoose.model("LostFound", lostFoundSchema);
