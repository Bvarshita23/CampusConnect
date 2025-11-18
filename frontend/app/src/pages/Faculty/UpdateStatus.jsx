import React, { useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { authFetch } from "../../utils/api";
import toast from "react-hot-toast";

export default function UpdateStatus() {
  const [loading, setLoading] = useState(false);

  const updateStatus = async (status) => {
    try {
      setLoading(true);
      await authFetch("/faculty/status/update", {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success(`Status updated to "${status}"`);
    } catch (err) {
      toast.error("Failed to update status");
    }
    setLoading(false);
  };

  return (
    <DashboardLayout title="Update Availability">
      <div className="bg-white p-8 rounded-2xl shadow max-w-lg mx-auto text-center space-y-6">
        <h2 className="text-2xl font-bold text-gray-800">Update Your Status</h2>

        <button
          onClick={() => updateStatus("Available")}
          disabled={loading}
          className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl font-semibold"
        >
          I Am Available
        </button>

        <button
          onClick={() => updateStatus("Not Available")}
          disabled={loading}
          className="w-full py-3 bg-red-500 hover:bg-red-600 text-white rounded-xl font-semibold"
        >
          I Am Not Available
        </button>
      </div>
    </DashboardLayout>
  );
}
