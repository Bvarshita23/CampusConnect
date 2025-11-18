// frontend/app/src/pages/Faculty/FacultyAvailability.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, MapPin, MessageCircle } from "lucide-react";
import toast from "react-hot-toast";

const STATUS_OPTIONS = ["Available", "In Class", "Busy", "On Leave", "Offline"];

export default function FacultyAvailabilityFaculty() {
  const [status, setStatus] = useState("Offline");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [profile, setProfile] = useState(null);

  const token = localStorage.getItem("token");

  // 🔹 Helper: save status to backend
  const saveStatusToBackend = async (
    newStatus,
    newMessage = "",
    newLocation = ""
  ) => {
    try {
      await axios.patch(
        "/api/v1/faculty/status/update",
        {
          status: newStatus,
          message: newMessage,
          location: newLocation,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
    } catch (err) {
      console.error("Auto status update failed:", err);
      // don't toast here to avoid spam on page load
    }
  };

  // 🔹 On mount: load current status.
  // If no status / 404 → set to "Available" automatically.
  useEffect(() => {
    const fetchStatus = async () => {
      try {
        const res = await axios.get("/api/v1/faculty/status/me", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const s = res.data.status || {};
        const currentStatus = s.status || "Offline";

        setStatus(currentStatus);
        setMessage(s.message || "");
        setLocation(s.location || "");
        setProfile(s.faculty || null);

        // If no status stored yet, auto-set to Available
        if (!s.status) {
          setStatus("Available");
          setMessage("");
          setLocation("");
          await saveStatusToBackend("Available", "", "");
        }
      } catch (err) {
        // If faculty has no status record yet, create one as "Available"
        if (err.response?.status === 404) {
          setStatus("Available");
          setMessage("");
          setLocation("");
          await saveStatusToBackend("Available", "", "");
        } else {
          console.error("Failed to load faculty status:", err);
          toast.error("Failed to load your current status");
        }
      } finally {
        setLoading(false);
      }
    };

    if (token) fetchStatus();
  }, [token]);

  const handleSave = async () => {
    if (!status) {
      toast.error("Please select a status");
      return;
    }

    setSaving(true);
    try {
      await saveStatusToBackend(status, message, location);
      toast.success("Status updated successfully");
    } catch (err) {
      console.error("Failed to update status:", err);
      toast.error("Failed to update status");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading your availability...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white max-w-3xl w-full rounded-2xl shadow-md p-6 md:p-8">
        {/* Header */}
        <h1 className="text-2xl md:text-3xl font-bold text-blue-700 mb-4">
          Manage Your Availability
        </h1>
        <p className="text-gray-600 mb-6">
          Set your current status so that students and admins can see if you are
          available, in class, or busy.
        </p>

        {/* Profile Card */}
        {profile && (
          <div className="flex items-center space-x-4 bg-blue-50 rounded-xl p-4 mb-6">
            <img
              src={profile.photo || "/default-avatar.png"}
              alt="Faculty"
              className="w-14 h-14 rounded-full border-2 border-white object-cover"
            />
            <div>
              <p className="font-semibold text-blue-800 text-lg">
                {profile.name}
              </p>
              <p className="text-sm text-gray-600">
                {profile.department || "Department not set"}
              </p>
            </div>
          </div>
        )}

        {/* Status Selector */}
        <div className="mb-5">
          <label className="block font-semibold mb-2 text-gray-700">
            Current Status
          </label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {STATUS_OPTIONS.map((opt) => {
              const isActive = status === opt;
              return (
                <button
                  key={opt}
                  type="button"
                  onClick={() => setStatus(opt)}
                  className={`px-3 py-2 rounded-lg border text-sm font-medium ${
                    isActive
                      ? "bg-blue-600 text-white border-blue-600"
                      : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Location */}
        <div className="mb-4">
          <label className="block font-semibold mb-1 text-gray-700">
            <span className="inline-flex items-center">
              <MapPin className="w-4 h-4 mr-1" /> Current Location (optional)
            </span>
          </label>
          <input
            type="text"
            placeholder="Example: CSE Block - Room 204"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Message */}
        <div className="mb-6">
          <label className="block font-semibold mb-1 text-gray-700">
            <span className="inline-flex items-center">
              <MessageCircle className="w-4 h-4 mr-1" /> Message for Students
              (optional)
            </span>
          </label>
          <textarea
            rows={3}
            placeholder="Example: In class till 11:30 AM. Available in cabin after that."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-400"
          />
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          disabled={saving}
          className="w-full flex items-center justify-center space-x-2 bg-blue-600 text-white rounded-lg py-2.5 font-semibold hover:bg-blue-700 disabled:opacity-60"
        >
          <Clock className="w-4 h-4" />
          <span>{saving ? "Saving..." : "Save Availability"}</span>
        </button>
      </div>
    </div>
  );
}
