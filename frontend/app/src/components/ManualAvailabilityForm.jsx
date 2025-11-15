import React, { useState } from "react";
import { authFetch } from "../utils/api";

export default function ManualAvailabilityForm({ onClose, onSuccess, initial = null }) {
  const [isAvailable, setIsAvailable] = useState(initial === null ? true : initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    try {
      setLoading(true);
      setError("");
      const res = await authFetch("/faculty-availability/update", {
        method: "PATCH",
        body: JSON.stringify({ isAvailable }),
      });
      if (res && res.success) {
        onSuccess && onSuccess(res.record);
      }
    } catch (err) {
      console.error("Manual update failed:", err);
      setError(err.message || "Update failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold">Manual Availability</h3>
          <button onClick={onClose} className="text-gray-600">Close</button>
        </div>

        {error && <div className="text-sm text-rose-600 mb-2">{error}</div>}

        <div className="mb-4">
          <label className="inline-flex items-center gap-2">
            <input type="radio" checked={isAvailable === true} onChange={() => setIsAvailable(true)} />
            <span className="ml-2">Available</span>
          </label>
          <label className="inline-flex items-center gap-2 ml-6">
            <input type="radio" checked={isAvailable === false} onChange={() => setIsAvailable(false)} />
            <span className="ml-2">Not Available</span>
          </label>
        </div>

        <div className="flex gap-3">
          <button onClick={submit} disabled={loading} className="bg-indigo-600 text-white px-4 py-2 rounded-lg">
            {loading ? "Updating..." : "Save"}
          </button>
          <button onClick={onClose} className="bg-gray-100 px-4 py-2 rounded-lg">Cancel</button>
        </div>
      </div>
    </div>
  );
}
