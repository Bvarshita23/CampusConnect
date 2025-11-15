import React, { useEffect, useState } from "react";
import { Clock, CheckCircle, XCircle, AlertCircle, Power } from "lucide-react";
import { authFetch } from "../utils/api";
import { motion } from "framer-motion";

const STATUS_OPTIONS = [
  {
    value: "Available",
    label: "Available",
    icon: <CheckCircle size={20} />,
    color: "bg-emerald-500 hover:bg-emerald-600",
    textColor: "text-emerald-700",
    bgColor: "bg-emerald-50",
  },
  {
    value: "In Class",
    label: "In Class",
    icon: <Clock size={20} />,
    color: "bg-blue-500 hover:bg-blue-600",
    textColor: "text-blue-700",
    bgColor: "bg-blue-50",
  },
  {
    value: "Busy",
    label: "Busy",
    icon: <AlertCircle size={20} />,
    color: "bg-amber-500 hover:bg-amber-600",
    textColor: "text-amber-700",
    bgColor: "bg-amber-50",
  },
  {
    value: "On Leave",
    label: "On Leave",
    icon: <XCircle size={20} />,
    color: "bg-rose-500 hover:bg-rose-600",
    textColor: "text-rose-700",
    bgColor: "bg-rose-50",
  },
  {
    value: "Offline",
    label: "Offline",
    icon: <Power size={20} />,
    color: "bg-slate-500 hover:bg-slate-600",
    textColor: "text-slate-700",
    bgColor: "bg-slate-50",
  },
];

export default function FacultyStatusUpdate() {
  const [currentStatus, setCurrentStatus] = useState("Offline");
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [message, setMessage] = useState("");

  // Fetch current status on mount
  useEffect(() => {
    fetchCurrentStatus();
  }, []);

  const fetchCurrentStatus = async () => {
    try {
      setLoading(true);
      const data = await authFetch("/faculty/status/me");
      if (data.success && data.status) {
        setCurrentStatus(data.status.status || "Offline");
        setMessage(data.status.message || "");
      }
    } catch (err) {
      console.error("Failed to fetch status:", err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (newStatus) => {
    if (newStatus === currentStatus) return;

    try {
      setUpdating(true);
      const data = await authFetch("/faculty/status/update", {
        method: "PATCH",
        body: JSON.stringify({
          status: newStatus,
          message: message,
        }),
      });

      if (data.success) {
        setCurrentStatus(newStatus);
        setMessage("");
      }
    } catch (err) {
      console.error("Failed to update status:", err);
      alert("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const currentStatusOption = STATUS_OPTIONS.find(
    (opt) => opt.value === currentStatus
  ) || STATUS_OPTIONS[STATUS_OPTIONS.length - 1];

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-6 shadow-md border border-blue-100">
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      className="bg-white rounded-3xl p-6 shadow-md border border-blue-100"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.1 }}
    >
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
          <Clock className="text-indigo-600" /> Update My Status
        </h3>
        <div
          className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${currentStatusOption.bgColor} ${currentStatusOption.textColor}`}
        >
          {currentStatusOption.icon}
          {currentStatusOption.label}
        </div>
      </div>

      {/* Status Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3 mb-6">
        {STATUS_OPTIONS.map((option) => (
          <motion.button
            key={option.value}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => updateStatus(option.value)}
            disabled={updating || currentStatus === option.value}
            className={`px-4 py-3 rounded-xl font-semibold text-white transition-all flex items-center justify-center gap-2 ${
              currentStatus === option.value
                ? `${option.color} shadow-lg ring-2 ring-offset-2 ring-offset-white ring-gray-400`
                : `${option.color} opacity-70 hover:opacity-100`
            } disabled:opacity-50 disabled:cursor-not-allowed`}
          >
            {option.icon}
            <span className="hidden sm:inline">{option.label}</span>
            <span className="sm:hidden">{option.label.split(" ")[0]}</span>
          </motion.button>
        ))}
      </div>

      {/* Optional Message Input */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Optional Message (e.g., "In meeting until 3 PM")
        </label>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Add a message..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>

      {/* Update Button with Message */}
      {message && (
        <button
          onClick={() => updateStatus(currentStatus)}
          disabled={updating}
          className="w-full bg-indigo-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-indigo-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {updating ? "Updating..." : "Update Message"}
        </button>
      )}

      {updating && (
        <div className="mt-4 text-center text-sm text-gray-500">
          Updating status...
        </div>
      )}
    </motion.div>
  );
}

