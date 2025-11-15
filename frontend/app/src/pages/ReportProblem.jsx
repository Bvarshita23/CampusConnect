import React, { useState } from "react";
import { motion } from "framer-motion";
import { Upload, AlertTriangle, Send } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";

const BACKEND_URL = "http://localhost:8080";

export default function ReportProblem() {
  const [formData, setFormData] = useState({
    title: "",
    category: "",
    description: "",
    image: null,
  });

  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const categories = [
    "Electricity",
    "Water Supply",
    "Parking",
    "Hygiene",
    "Infrastructure",
    "Internet/Wi-Fi",
    "Other",
  ];

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "image") {
      const file = files[0];
      setFormData((prev) => ({ ...prev, image: file }));
      setPreview(URL.createObjectURL(file));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = JSON.parse(localStorage.getItem("user"));
      if (!user) {
        alert("Please log in first.");
        return;
      }

      const fd = new FormData();
      fd.append("title", formData.title);
      fd.append("category", formData.category);
      fd.append("description", formData.description);
      fd.append("image", formData.image);
      fd.append("userId", user._id);
      fd.append("reportedBy", user.name);
      fd.append("department", user.department || "General");

      const res = await fetch(`${BACKEND_URL}/api/v1/problems/report`, {
        method: "POST",
        body: fd,
      });

      const data = await res.json();
      if (data.success) {
        alert("✅ Problem reported successfully!");
        setFormData({ title: "", category: "", description: "", image: null });
        setPreview(null);
      } else {
        alert(`⚠️ ${data.message}`);
      }
    } catch (err) {
      console.error("Error reporting problem:", err);
      alert("❌ Server error while reporting problem.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout title="Report a Problem">
      <motion.div
        className="max-w-3xl mx-auto bg-white p-8 rounded-3xl shadow-xl border border-blue-100"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex items-center gap-3 mb-6">
          <AlertTriangle size={28} className="text-red-500" />
          <h2 className="text-2xl font-semibold text-gray-800">
            Report a Problem
          </h2>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="title"
            placeholder="Problem Title"
            value={formData.title}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
          />

          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            required
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
          >
            <option value="">Select Category</option>
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <textarea
            name="description"
            placeholder="Describe the issue in detail..."
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-400"
          ></textarea>

          {preview && (
            <div className="flex justify-center mb-3">
              <img
                src={preview}
                alt="Preview"
                className="w-40 h-40 object-cover rounded-xl border border-blue-200 shadow"
              />
            </div>
          )}

          <label className="flex items-center gap-3 border px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50 transition">
            <Upload size={18} className="text-blue-600" />
            <span>
              {formData.image ? formData.image.name : "Upload Image (optional)"}
            </span>
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
              hidden
            />
          </label>

          <motion.button
            whileHover={{ scale: 1.05 }}
            disabled={loading}
            className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg shadow-lg hover:shadow-xl transition"
          >
            {loading ? (
              "Submitting..."
            ) : (
              <span className="flex items-center justify-center gap-2">
                <Send size={18} /> Submit Problem
              </span>
            )}
          </motion.button>
        </form>
      </motion.div>
    </DashboardLayout>
  );
}
