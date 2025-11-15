import React, { useState, useEffect } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import axios from "../../api/axiosConfig";

export default function ReportProblem() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "General",
  });
  const [problems, setProblems] = useState([]);
  const token = localStorage.getItem("token");

  // ✅ Fetch all problems
  const fetchProblems = async () => {
    try {
      const res = await axios.get("/api/v1/problems", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) setProblems(res.data.problems || []);
    } catch (err) {
      console.error("Fetch problems error:", err);
    }
  };

  useEffect(() => {
    fetchProblems();
  }, []);

  // ✅ Handle change
  const handleChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  // ✅ Submit problem
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await axios.post("/api/v1/problems", form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        alert("✅ Problem reported successfully!");
        setForm({ title: "", description: "", category: "General" });
        fetchProblems(); // refresh after adding
      } else alert(`⚠️ ${res.data.message}`);
    } catch (err) {
      console.error("Add problem error:", err);
      alert("❌ Failed to add problem");
    }
  };

  return (
    <DashboardLayout title="Problem Reporting">
      <div className="max-w-5xl mx-auto space-y-6">
        {/* Report Form */}
        <form
          onSubmit={handleSubmit}
          className="bg-white shadow-lg rounded-2xl p-6 mb-6"
        >
          <h2 className="text-xl font-semibold text-blue-700 mb-4">
            Report a Problem
          </h2>
          <input
            type="text"
            name="title"
            placeholder="Problem title"
            value={form.title}
            onChange={handleChange}
            required
            className="w-full mb-3 border px-4 py-2 rounded-lg"
          />
          <textarea
            name="description"
            placeholder="Describe your issue..."
            value={form.description}
            onChange={handleChange}
            required
            className="w-full mb-3 border px-4 py-2 rounded-lg"
          />
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full mb-3 border px-4 py-2 rounded-lg"
          >
            <option>General</option>
            <option>Hostel</option>
            <option>Library</option>
            <option>Mess</option>
            <option>WiFi</option>
          </select>
          <button className="w-full bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700">
            Submit
          </button>
        </form>

        {/* ✅ All Reported Problems */}
        <div className="bg-white shadow-lg rounded-2xl p-6">
          <h3 className="text-lg font-semibold text-blue-700 mb-3">
            All Reported Problems
          </h3>
          {problems.length === 0 ? (
            <p className="text-gray-500">No problems reported yet.</p>
          ) : (
            <div className="space-y-3">
              {problems.map((p) => (
                <div
                  key={p._id}
                  className="border rounded-lg p-3 flex justify-between items-center"
                >
                  <div>
                    <h4 className="font-semibold">{p.title}</h4>
                    <p className="text-sm text-gray-600">{p.description}</p>
                    <p className="text-xs text-gray-400">
                      Category: {p.category}
                    </p>
                    <p className="text-xs text-gray-400 italic">
                      Reported by: {p.postedBy?.name || "Unknown"}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs rounded-full ${
                      p.status === "Completed"
                        ? "bg-green-100 text-green-700"
                        : p.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {p.status || "Pending"}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
