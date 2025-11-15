import React, { useEffect, useRef, useState } from "react";
import { Video, VideoOff, Power, PowerOff, AlertCircle, CheckCircle2, Clock } from "lucide-react";
import { authFetch } from "../utils/api";
import toast from "react-hot-toast";

export default function AutoCameraDetection({ onStatusChange }) {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);
  const canvasRef = useRef(null);
  const [isActive, setIsActive] = useState(false);
  const [isDetecting, setIsDetecting] = useState(false);
  const [detectionStatus, setDetectionStatus] = useState("Absent");
  const [lastDetected, setLastDetected] = useState(null);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [detectionTimeout, setDetectionTimeout] = useState(30000); // 30 seconds default

  // Fetch current detection status on mount
  useEffect(() => {
    fetchStatus();
  }, []);

  const fetchStatus = async () => {
    try {
      const res = await authFetch("/faculty-availability/camera/status");
      if (res.success) {
        setIsActive(res.status.enabled);
        setDetectionStatus(res.status.autoStatus || "Absent");
        setLastDetected(res.status.lastDetected);
        if (res.status.enabled && !isDetecting) {
          startDetection();
        }
      }
    } catch (err) {
      console.error("Failed to fetch detection status:", err);
    }
  };

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      return true;
    } catch (err) {
      console.error("Camera access error:", err);
      setError("Unable to access camera. Please allow camera permission.");
      toast.error("Camera access denied");
      return false;
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  };

  const captureAndProcessFrame = async () => {
    if (!videoRef.current || !canvasRef.current) return;

    try {
      const canvas = canvasRef.current;
      const video = videoRef.current;

      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

      // Convert to blob and send to backend
      canvas.toBlob(async (blob) => {
        if (!blob) return;

        const formData = new FormData();
        formData.append("frame", blob, `frame-${Date.now()}.jpg`);

        try {
          await authFetch("/faculty-availability/camera/process-frame", {
            method: "POST",
            body: formData,
          });

          // Update local status
          setDetectionStatus("Present");
          setLastDetected(new Date());
          if (onStatusChange) {
            onStatusChange("Present");
          }
        } catch (err) {
          console.error("Frame processing error:", err);
        }
      }, "image/jpeg", 0.8);
    } catch (err) {
      console.error("Capture error:", err);
    }
  };

  const startDetection = async () => {
    if (isDetecting) return;

    setLoading(true);
    setError("");

    try {
      // Start camera
      const cameraStarted = await startCamera();
      if (!cameraStarted) {
        setLoading(false);
        return;
      }

      // Start backend detection
      const res = await authFetch("/faculty-availability/camera/start", {
        method: "POST",
        body: JSON.stringify({
          cameraDeviceId: 0,
          detectionTimeout: detectionTimeout,
        }),
      });

      if (res.success) {
        setIsActive(true);
        setIsDetecting(true);

        // Start periodic frame capture (every 2 seconds)
        intervalRef.current = setInterval(() => {
          captureAndProcessFrame();
        }, 2000);

        toast.success("Camera detection started");
        fetchStatus();
      } else {
        stopCamera();
        setError(res.message || "Failed to start detection");
        toast.error(res.message || "Failed to start detection");
      }
    } catch (err) {
      console.error("Start detection error:", err);
      stopCamera();
      setError(err.message || "Failed to start detection");
      toast.error("Failed to start detection");
    } finally {
      setLoading(false);
    }
  };

  const stopDetection = async () => {
    setLoading(true);

    try {
      // Stop backend detection
      const res = await authFetch("/faculty-availability/camera/stop", {
        method: "POST",
      });

      if (res.success) {
        setIsActive(false);
        setIsDetecting(false);
        setDetectionStatus("Absent");

        // Stop frame capture
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
          intervalRef.current = null;
        }

        // Stop camera
        stopCamera();

        toast.success("Camera detection stopped");
        if (onStatusChange) {
          onStatusChange("Absent");
        }
      } else {
        setError(res.message || "Failed to stop detection");
        toast.error(res.message || "Failed to stop detection");
      }
    } catch (err) {
      console.error("Stop detection error:", err);
      setError(err.message || "Failed to stop detection");
      toast.error("Failed to stop detection");
    } finally {
      setLoading(false);
    }
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
      stopCamera();
    };
  }, []);

  return (
    <div className="bg-white rounded-2xl p-6 shadow-lg border border-blue-100">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
            <Video className="text-indigo-600" size={24} />
            Auto Camera Detection
          </h3>
          <p className="text-sm text-gray-600 mt-1">
            Automatically detect your presence using camera
          </p>
        </div>
        <div className="flex items-center gap-3">
          {isActive ? (
            <button
              onClick={stopDetection}
              disabled={loading}
              className="flex items-center gap-2 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 disabled:opacity-50"
            >
              <PowerOff size={18} />
              Stop Detection
            </button>
          ) : (
            <button
              onClick={startDetection}
              disabled={loading}
              className="flex items-center gap-2 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 disabled:opacity-50"
            >
              <Power size={18} />
              Start Detection
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center gap-2 text-red-700">
          <AlertCircle size={18} />
          <span className="text-sm">{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Camera Feed */}
        <div className="bg-gray-900 rounded-lg overflow-hidden relative">
          {isDetecting ? (
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 flex items-center justify-center bg-gray-800">
              <VideoOff className="text-gray-600" size={48} />
            </div>
          )}
          {isDetecting && (
            <div className="absolute top-2 right-2">
              <div className="bg-red-500 rounded-full w-3 h-3 animate-pulse"></div>
            </div>
          )}
        </div>

        {/* Status Panel */}
        <div className="space-y-4">
          <div className="bg-blue-50 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">Detection Status</span>
              {detectionStatus === "Present" ? (
                <CheckCircle2 className="text-green-500" size={20} />
              ) : (
                <AlertCircle className="text-gray-400" size={20} />
              )}
            </div>
            <div className="text-2xl font-bold text-gray-800">
              {detectionStatus}
            </div>
            {lastDetected && (
              <div className="flex items-center gap-2 mt-2 text-xs text-gray-600">
                <Clock size={14} />
                Last detected: {new Date(lastDetected).toLocaleTimeString()}
              </div>
            )}
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Absence Timeout (seconds)
            </label>
            <input
              type="number"
              min="10"
              max="120"
              value={detectionTimeout / 1000}
              onChange={(e) => setDetectionTimeout(parseInt(e.target.value) * 1000)}
              disabled={isActive}
              className="w-full px-3 py-2 border rounded-lg"
            />
            <p className="text-xs text-gray-500 mt-1">
              Status changes to "Absent" after no detection for this duration
            </p>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-xs text-yellow-800">
              <strong>Note:</strong> The system continuously monitors the camera feed. If no person
              is detected for {detectionTimeout / 1000} seconds, your status will automatically
              change to "Absent". Manual status updates will override automatic detection.
            </p>
          </div>
        </div>
      </div>

      {/* Hidden canvas for frame capture */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}

