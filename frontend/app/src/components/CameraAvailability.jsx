import React, { useEffect, useRef, useState } from "react";
import { Camera, X } from "lucide-react";
import { authFetch } from "../utils/api";

export default function CameraAvailability({ onClose, onSuccess }) {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const streamRef = useRef(null);
  const [capturing, setCapturing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const start = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: true });
        streamRef.current = stream;
        if (videoRef.current) videoRef.current.srcObject = stream;
      } catch (err) {
        console.error("Camera error:", err);
        setError("Unable to access camera. Please allow camera permission or try a different device.");
      }
    };
    start();

    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
      }
    };
  }, []);

  const captureAndUpload = async () => {
    try {
      setCapturing(true);
      const video = videoRef.current;
      const canvas = canvasRef.current;
      canvas.width = video.videoWidth || 640;
      canvas.height = video.videoHeight || 480;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
      const blob = await new Promise((res) => canvas.toBlob(res, "image/jpeg", 0.9));

      const form = new FormData();
      form.append("photo", blob, `capture-${Date.now()}.jpg`);

      // Upload to camera-update endpoint
      const res = await authFetch("/faculty-availability/camera-update", {
        method: "POST",
        body: form,
      });

      if (res && res.success) {
        onSuccess && onSuccess(res.record);
      }
    } catch (err) {
      console.error("Capture/upload failed:", err);
      setError(err.message || "Upload failed");
    } finally {
      setCapturing(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-4 w-full max-w-2xl">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Camera size={18} /> Camera Availability
          </h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-gray-100">
            <X />
          </button>
        </div>

        {error && <div className="text-sm text-rose-600 mb-2">{error}</div>}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-gray-900 rounded-md overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-72 object-cover" />
          </div>
          <div>
            <canvas ref={canvasRef} style={{ display: "none" }} />
            <p className="text-sm text-gray-600 mb-3">Point your camera at yourself and press Capture to mark yourself available. The image will be uploaded and availability will be set.</p>
            <div className="flex gap-3">
              <button
                onClick={captureAndUpload}
                disabled={capturing}
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg"
              >
                {capturing ? "Capturing..." : "Capture & Mark Available"}
              </button>
              <button onClick={onClose} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
