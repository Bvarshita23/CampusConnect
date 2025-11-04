import mongoose from "mongoose";

const refreshSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  token: { type: String, required: true },
  expiresAt: Date,
  isRevoked: { type: Boolean, default: false },
});

export default mongoose.model("RefreshToken", refreshSchema);
