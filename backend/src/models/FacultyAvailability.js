import mongoose from "mongoose";

const facultyAvailabilitySchema = new mongoose.Schema(
  {
    faculty: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true, // one record per faculty
    },
    imageUrl: { type: String }, // stored face image
    isAvailable: { type: Boolean, default: false },
    manualOverride: { type: Boolean, default: false }, // true if faculty sets status manually
    lastUpdated: { type: Date, default: Date.now },
    // Camera detection fields
    cameraDetectionEnabled: { type: Boolean, default: false },
    lastPersonDetected: { type: Date }, // Last time a person was detected
    detectionTimeout: { type: Number, default: 30000 }, // Timeout in ms (30 seconds default)
    cameraStreamUrl: { type: String }, // Camera stream URL or device ID
    autoStatus: { type: String, enum: ["Present", "Absent"], default: "Absent" }, // Auto-detected status
  },
  { timestamps: true }
);

export default mongoose.model("FacultyAvailability", facultyAvailabilitySchema);
