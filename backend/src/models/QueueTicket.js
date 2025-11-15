import mongoose from "mongoose";

const queueTicketSchema = new mongoose.Schema(
  {
    ticketNumber: { type: String, unique: true, index: true },
    service: { type: String, required: true, trim: true, index: true },
    department: { type: String, trim: true },
    description: { type: String, trim: true },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: ["waiting", "called", "serving", "completed", "cancelled"],
      default: "waiting",
      index: true,
    },
    position: { type: Number, required: true },
    estimatedTime: { type: Date },
    handledBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    completedAt: { type: Date },
    cancelledReason: { type: String, trim: true },
  },
  { timestamps: true }
);

queueTicketSchema.index({ service: 1, status: 1, position: 1 });

export default mongoose.model("QueueTicket", queueTicketSchema);






