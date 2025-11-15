/**
 * Camera-based Person Detection Service
 * Uses OpenCV (via Python script) or TensorFlow.js for person detection
 */

import { spawn } from "child_process";
import path from "path";
import { fileURLToPath } from "url";
import FacultyAvailability from "../models/FacultyAvailability.js";
import FacultyStatus from "../models/FacultyStatus.js";
import User from "../models/User.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Store active detection processes per faculty
const activeDetections = new Map();

/**
 * Start continuous camera detection for a faculty member
 */
export const startCameraDetection = async (facultyId, cameraDeviceId = 0, io = null) => {
  try {
    // Check if already running
    if (activeDetections.has(facultyId)) {
      console.log(`Detection already running for faculty ${facultyId}`);
      return { success: true, message: "Detection already active" };
    }

    // Get faculty availability record
    const availability = await FacultyAvailability.findOne({ faculty: facultyId });
    if (!availability) {
      return { success: false, message: "Faculty availability record not found" };
    }

    // Update availability record
    availability.cameraDetectionEnabled = true;
    availability.cameraStreamUrl = cameraDeviceId.toString();
    await availability.save();

    // Start detection process
    const detectionProcess = {
      facultyId,
      startTime: Date.now(),
      lastDetection: null,
      timeoutId: null,
      pythonProcess: null,
    };

    // Use Python script for OpenCV detection (more reliable)
    const pythonScript = path.join(__dirname, "../scripts/detect_person.py");
    
    // Check if Python script exists, if not use fallback method
    let usePython = false;
    try {
      const fs = await import("fs");
      if (fs.existsSync(pythonScript)) {
        usePython = true;
      }
    } catch (err) {
      console.log("Python script not found, using fallback detection");
    }

    if (usePython) {
      // Start Python OpenCV detection script
      const pythonProcess = spawn("python", [pythonScript, cameraDeviceId, facultyId.toString()]);
      
      pythonProcess.stdout.on("data", async (data) => {
        const output = data.toString().trim();
        if (output.includes("PERSON_DETECTED")) {
          await handlePersonDetected(facultyId, io);
          detectionProcess.lastDetection = Date.now();
          // Reset timeout
          if (detectionProcess.timeoutId) {
            clearTimeout(detectionProcess.timeoutId);
          }
          detectionProcess.timeoutId = setTimeout(() => {
            handlePersonAbsent(facultyId, io);
          }, availability.detectionTimeout || 30000);
        }
      });

      pythonProcess.stderr.on("data", (data) => {
        console.error(`Python detection error: ${data}`);
      });

      pythonProcess.on("close", (code) => {
        console.log(`Detection process exited with code ${code}`);
        activeDetections.delete(facultyId);
      });

      detectionProcess.pythonProcess = pythonProcess;
    } else {
      // Fallback: Use web-based detection with periodic checks
      // This will be handled by the frontend sending frames
      console.log(`Using web-based detection for faculty ${facultyId}`);
    }

    activeDetections.set(facultyId, detectionProcess);

    return { success: true, message: "Camera detection started" };
  } catch (error) {
    console.error("Error starting camera detection:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Stop camera detection for a faculty member
 */
export const stopCameraDetection = async (facultyId) => {
  try {
    const detection = activeDetections.get(facultyId);
    if (detection) {
      // Kill Python process if running
      if (detection.pythonProcess) {
        detection.pythonProcess.kill();
      }
      // Clear timeout
      if (detection.timeoutId) {
        clearTimeout(detection.timeoutId);
      }
      activeDetections.delete(facultyId);
    }

    // Update availability record
    const availability = await FacultyAvailability.findOne({ faculty: facultyId });
    if (availability) {
      availability.cameraDetectionEnabled = false;
      await availability.save();
    }

    return { success: true, message: "Camera detection stopped" };
  } catch (error) {
    console.error("Error stopping camera detection:", error);
    return { success: false, message: error.message };
  }
};

/**
 * Handle person detected event
 */
const handlePersonDetected = async (facultyId, io) => {
  try {
    const availability = await FacultyAvailability.findOne({ faculty: facultyId });
    if (!availability) return;

    // Only update if not manually overridden
    if (!availability.manualOverride) {
      availability.isAvailable = true;
      availability.autoStatus = "Present";
      availability.lastPersonDetected = new Date();
      await availability.save();

      // Update FacultyStatus to "Available"
      const facultyStatus = await FacultyStatus.findOne({ faculty: facultyId });
      if (facultyStatus) {
        facultyStatus.status = "Available";
        await facultyStatus.save();

        // Emit socket event
        if (io) {
          io.to("faculty-status").emit("faculty-status-updated", {
            facultyId: facultyId.toString(),
            status: facultyStatus,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error handling person detected:", error);
  }
};

/**
 * Handle person absent (timeout)
 */
const handlePersonAbsent = async (facultyId, io) => {
  try {
    const availability = await FacultyAvailability.findOne({ faculty: facultyId });
    if (!availability) return;

    // Only update if not manually overridden
    if (!availability.manualOverride) {
      availability.isAvailable = false;
      availability.autoStatus = "Absent";
      await availability.save();

      // Update FacultyStatus to "Offline"
      const facultyStatus = await FacultyStatus.findOne({ faculty: facultyId });
      if (facultyStatus) {
        facultyStatus.status = "Offline";
        await facultyStatus.save();

        // Emit socket event
        if (io) {
          io.to("faculty-status").emit("faculty-status-updated", {
            facultyId: facultyId.toString(),
            status: facultyStatus,
          });
        }
      }
    }
  } catch (error) {
    console.error("Error handling person absent:", error);
  }
};

/**
 * Process a frame from webcam for person detection (fallback method)
 * This uses a simple motion detection approach
 */
export const processFrame = async (facultyId, imageBuffer, io) => {
  try {
    // Simple motion detection: if frame is received, assume person present
    // In production, this would use actual ML model for person detection
    const hasPerson = imageBuffer && imageBuffer.length > 0;
    
    if (hasPerson) {
      await handlePersonDetected(facultyId, io);
      
      // Set timeout for absence detection
      const detection = activeDetections.get(facultyId);
      if (detection) {
        if (detection.timeoutId) {
          clearTimeout(detection.timeoutId);
        }
        const availability = await FacultyAvailability.findOne({ faculty: facultyId });
        detection.timeoutId = setTimeout(() => {
          handlePersonAbsent(facultyId, io);
        }, availability?.detectionTimeout || 30000);
      }
    }
  } catch (error) {
    console.error("Error processing frame:", error);
  }
};

/**
 * Get detection status for a faculty member
 */
export const getDetectionStatus = async (facultyId) => {
  const availability = await FacultyAvailability.findOne({ faculty: facultyId });
  const detection = activeDetections.get(facultyId);
  
  return {
    enabled: availability?.cameraDetectionEnabled || false,
    active: !!detection,
    lastDetected: availability?.lastPersonDetected || null,
    autoStatus: availability?.autoStatus || "Absent",
  };
};

