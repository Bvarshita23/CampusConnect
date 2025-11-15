import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "../../api/axiosConfig";
import { motion } from "framer-motion";

export default function ManageProblems() {
  const [problems, setProblems] = useState([]);
  const token = localStorage.getItem("token");

  const fetchProblems = async () => {
    try {
      const res = await axios.get("/api/v1/problems", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setProblems(res.data.problems);
    } catch (err) {
      console.error("Fetch problems error:", err);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  const handleStatusChange = async (id, status) => {
    try {
      const res = await axios.patch(
        `/api/v1/problems/${id}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert("✅ Status updated successfully!");
        fetchProblems();
      } else alert("⚠️ Failed to update status");
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Error updating problem status");
    }
  };

  return (
    <DashboardLayout title="Manage Reported Problems">
      <div className="max-w-6xl mx-auto space-y-6">
        <h2 className="text-xl font-semibold text-blue-700">
          All Reported Problems
        </h2>
        {problems.length === 0 ? (
          <p className="text-gray-500">No problems found.</p>
        ) : (
          <div className="space-y-3">
            {problems.map((p) => (
              <motion.div
                key={p._id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="border rounded-lg p-4 bg-white shadow flex justify-between items-center"
              >
                <div>
                  <h3 className="font-semibold text-gray-800">{p.title}</h3>
                  <p className="text-sm text-gray-600">{p.description}</p>
                  <p className="text-xs text-gray-400">
                    Category: {p.category}
                  </p>
                  <p className="text-xs text-gray-400">
                    Reported by: {p.postedBy?.name || "Unknown"}
                  </p>
                </div>
                <div className="flex flex-col gap-2 items-end">
                  <span
                    className={`px-3 py-1 rounded-full text-xs ${
                      p.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status}
                  </span>

                  <div className="flex gap-2">
                    <button
                      onClick={() => handleStatusChange(p._id, "In Progress")}
                      className="px-3 py-1 bg-yellow-500 text-white rounded hover:bg-yellow-600 text-xs"
                    >
                      In Progress
                    </button>
                    <button
                      onClick={() => handleStatusChange(p._id, "Completed")}
                      className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 text-xs"
                    >
                      Completed
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
