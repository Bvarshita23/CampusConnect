import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { authFetch, authPost } from "../../utils/api";
import toast from "react-hot-toast";

export default function FacultyUpdateAvailability() {
  const [status, setStatus] = useState("Offline");
  const [message, setMessage] = useState("");
  const [location, setLocation] = useState("");

  const fetchMyStatus = async () => {
    try {
      const data = await authFetch("/faculty/status/me");
      setStatus(data.status.status);
      setMessage(data.status.message || "");
      setLocation(data.status.location || "");
    } catch {
      toast.error("Failed to load status");
    }
  };

  const handleUpdate = async () => {
    try {
      await authPost("/faculty/status/update", { status, message, location });
      toast.success("Status updated!");
    } catch {
      toast.error("Update failed");
    }
  };

  useEffect(() => {
    fetchMyStatus();
  }, []);

  return (
    <DashboardLayout title="Update My Availability">
      <div className="bg-white shadow p-8 rounded-xl space-y-6 max-w-xl mx-auto">
        <div>
          <label className="font-semibold">My Current Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full border rounded-md p-3 mt-2"
          >
            <option>Available</option>
            <option>In Class</option>
            <option>Busy</option>
            <option>On Leave</option>
            <option>Offline</option>
          </select>
        </div>

        <div>
          <label className="font-semibold">Location (optional)</label>
          <input
            className="w-full border rounded-md p-3 mt-2"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            placeholder="Eg: Room 203, Lab-1..."
          />
        </div>

        <div>
          <label className="font-semibold">Message (optional)</label>
          <textarea
            rows="3"
            className="w-full border rounded-md p-3 mt-2"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Eg: In a meeting until 2 PM"
          />
        </div>

        <button
          onClick={handleUpdate}
          className="w-full bg-blue-600 text-white py-3 rounded-xl font-semibold"
        >
          Update Status
        </button>
      </div>
    </DashboardLayout>
  );
}
