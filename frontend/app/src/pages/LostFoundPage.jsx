import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PlusCircle,
  Trash2,
  CheckCircle,
  X,
  Upload,
  Loader2,
  ShieldCheck,
} from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "../api/axiosConfig";
import toast, { Toaster } from "react-hot-toast";

export default function LostFoundPage() {
  const [items, setItems] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [showClaim, setShowClaim] = useState(null);
  const [preview, setPreview] = useState(null);
  const [filter, setFilter] = useState("all");
  const [form, setForm] = useState({
    title: "",
    description: "",
    location: "",
    type: "lost",
    photo: null,
    uniqueQuestion: "",
    correctAnswer: "",
  });
  const [claimAnswer, setClaimAnswer] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));
  const FILE_BASE = "http://localhost:8080";

  // ✅ Fetch items
  const fetchItems = async () => {
    try {
      const res = await axios.get("/api/v1/lostfound", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        setItems(res.data.items || []);
        setFiltered(res.data.items || []);
      }
    } catch (err) {
      console.error("fetchItems error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchItems();
  }, []);

  const handleFilter = (val) => {
    setFilter(val);
    if (val === "all") setFiltered(items);
    else if (val === "lost")
      setFiltered(items.filter((i) => i.type === "lost"));
    else if (val === "found")
      setFiltered(items.filter((i) => i.type === "found"));
    else if (val === "mine")
      setFiltered(items.filter((i) => i.postedBy?._id === user._id));
  };

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files?.[0];
      setForm((p) => ({ ...p, photo: file }));
      setPreview(file ? URL.createObjectURL(file) : null);
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      Object.entries(form).forEach(([k, v]) => {
        if (v) fd.append(k, v);
      });

      const res = await axios.post("/api/v1/lostfound", fd, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "multipart/form-data",
        },
      });

      if (res.data.success) {
        toast.success(res.data.message);
        setShowAdd(false);
        setForm({
          title: "",
          description: "",
          location: "",
          type: "lost",
          photo: null,
          uniqueQuestion: "",
          correctAnswer: "",
        });
        setPreview(null);
        fetchItems();
      }
    } catch (err) {
      toast.error("Error adding item");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this item?")) return;
    try {
      await axios.delete(`/api/v1/lostfound/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success("Deleted!");
      fetchItems();
    } catch {
      toast.error("Failed to delete");
    }
  };

  const handleReturn = async (id) => {
    try {
      await axios.patch(
        `/api/v1/lostfound/return/${id}`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      toast.success("Marked as returned!");
      fetchItems();
    } catch {
      toast.error("Failed to mark returned");
    }
  };

  const handleClaim = async (id) => {
    try {
      const res = await axios.post(
        `/api/v1/lostfound/verify/${id}`,
        { selectedAnswer: claimAnswer },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        toast.success("Claim verified successfully!");
        setShowClaim(null);
        fetchItems();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error("Claim failed");
    }
  };

  return (
    <DashboardLayout title="Lost & Found">
      <Toaster position="top-center" />
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold text-indigo-700">
            Secure Lost & Found
          </h2>
          <motion.button
            whileHover={{ scale: 1.05 }}
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-xl shadow-lg"
          >
            <PlusCircle size={20} /> Report Lost / Found
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-3 justify-center mt-4">
          {["all", "lost", "found", "mine"].map((f) => (
            <button
              key={f}
              onClick={() => handleFilter(f)}
              className={`px-4 py-1 rounded-full border ${
                filter === f
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600 border-indigo-300"
              }`}
            >
              {f === "all"
                ? "All"
                : f === "mine"
                ? "My Items"
                : f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>

        {/* Table */}
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="animate-spin text-indigo-600" size={28} />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-center text-gray-500 mt-8">No items found.</p>
        ) : (
          <div className="overflow-x-auto shadow-md rounded-2xl bg-white">
            <table className="min-w-full border-collapse text-sm">
              <thead className="bg-indigo-50 text-indigo-700">
                <tr>
                  <th className="px-4 py-3 text-left">Image</th>
                  <th className="px-4 py-3 text-left">Title</th>
                  <th className="px-4 py-3 text-left">Type</th>
                  <th className="px-4 py-3 text-left">Location</th>
                  <th className="px-4 py-3 text-left">Status</th>
                  <th className="px-4 py-3 text-left">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((item) => (
                  <tr
                    key={item._id}
                    className="border-t hover:bg-gray-50 transition"
                  >
                    <td className="px-4 py-2">
                      {item.imageUrl ? (
                        <img
                          src={`${FILE_BASE}${item.imageUrl}`}
                          alt={item.title}
                          className="w-16 h-16 object-cover rounded-md"
                        />
                      ) : (
                        <span className="text-gray-400 italic">No image</span>
                      )}
                    </td>
                    <td className="px-4 py-2 font-medium">{item.title}</td>
                    <td className="px-4 py-2 capitalize">{item.type}</td>
                    <td className="px-4 py-2">{item.location}</td>
                    <td className="px-4 py-2">
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${
                          item.status === "verified"
                            ? "bg-green-100 text-green-700"
                            : item.status === "matched"
                            ? "bg-yellow-100 text-yellow-700"
                            : "bg-gray-100 text-gray-700"
                        }`}
                      >
                        {item.status}
                      </span>
                    </td>
                    <td className="px-4 py-2 flex gap-2">
                      {/* ✅ Claim Button */}
                      {item.type === "found" &&
                        item.postedBy?._id !== user._id &&
                        item.status === "open" && (
                          <button
                            onClick={() => setShowClaim(item)}
                            className="p-1 text-blue-600 hover:text-blue-800"
                            title="Claim Item"
                          >
                            <ShieldCheck size={18} />
                          </button>
                        )}

                      {/* ✅ Mark as Returned */}
                      {item.postedBy?._id === user._id &&
                        item.status !== "returned" && (
                          <button
                            onClick={() => handleReturn(item._id)}
                            className="p-1 text-green-600 hover:text-green-800"
                            title="Mark as Returned"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}

                      {/* ✅ Delete */}
                      {item.postedBy?._id === user._id && (
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="p-1 text-red-600 hover:text-red-800"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      {/* 📩 Claim Modal */}
      <AnimatePresence>
        {showClaim && (
          <motion.div
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-6 rounded-2xl w-[90%] max-w-md relative shadow-lg"
              initial={{ scale: 0.95 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.95 }}
            >
              <button
                onClick={() => setShowClaim(null)}
                className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
              >
                <X size={22} />
              </button>
              <h2 className="text-xl font-semibold text-indigo-700 mb-3 text-center">
                Claim Verification
              </h2>
              <p className="text-gray-600 mb-2 text-center">
                {showClaim.uniqueQuestion || "No verification question set."}
              </p>
              <input
                type="text"
                value={claimAnswer}
                onChange={(e) => setClaimAnswer(e.target.value)}
                placeholder="Enter your answer..."
                className="w-full border px-3 py-2 rounded-md mb-3"
              />
              <motion.button
                whileHover={{ scale: 1.03 }}
                onClick={() => handleClaim(showClaim._id)}
                className="w-full bg-indigo-600 text-white py-2 rounded-lg shadow"
              >
                Submit Answer
              </motion.button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
