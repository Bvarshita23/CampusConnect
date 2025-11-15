import React, { useEffect, useState } from "react";
import axios from "axios";
import { Clock, CheckCircle, Search, XCircle } from "lucide-react";
import toast, { Toaster } from "react-hot-toast";

export default function History() {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("token");

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(
        "http://localhost:8080/api/v1/lostfound/history",
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      setItems(res.data.items || []);
    } catch (err) {
      console.error("Fetch history error:", err);
      toast.error("Error fetching your history");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const filtered = items.filter(
    (i) =>
      i.title?.toLowerCase().includes(search.toLowerCase()) ||
      i.description?.toLowerCase().includes(search.toLowerCase()) ||
      i.location?.toLowerCase().includes(search.toLowerCase())
  );

  const getStatusColor = (status) => {
    switch (status) {
      case "verified":
        return "bg-green-100 text-green-800 border-green-300";
      case "matched":
        return "bg-yellow-100 text-yellow-800 border-yellow-300";
      case "returned":
        return "bg-blue-100 text-blue-800 border-blue-300";
      default:
        return "bg-gray-100 text-gray-800 border-gray-300";
    }
  };

  return (
    <div className="max-w-5xl mx-auto p-6 bg-white rounded-2xl shadow-md">
      <Toaster position="top-center" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-[#0A66C2] flex items-center gap-2">
          <Clock size={24} /> My History
        </h2>

        {/* Search bar */}
        <div className="relative w-64">
          <input
            type="text"
            value={search}
            placeholder="Search history..."
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-8 py-2 border rounded-lg focus:ring-2 focus:ring-[#0A66C2] outline-none"
          />
          {search ? (
            <XCircle
              size={18}
              className="absolute right-2 top-2.5 text-gray-400 cursor-pointer"
              onClick={() => setSearch("")}
            />
          ) : (
            <Search
              size={18}
              className="absolute left-2.5 top-2.5 text-gray-400"
            />
          )}
        </div>
      </div>

      {/* Loading or Empty */}
      {loading ? (
        <p className="text-center text-gray-500 py-10">Loading history...</p>
      ) : filtered.length === 0 ? (
        <p className="text-center text-gray-400 py-10">
          No history found yet. Your verified and returned items will appear
          here.
        </p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filtered.map((item) => (
            <div
              key={item._id}
              className="border border-gray-200 rounded-xl p-4 shadow-sm hover:shadow-md transition"
            >
              {/* Image */}
              {item.imageUrl && (
                <img
                  src={`http://localhost:8080${item.imageUrl}`}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}

              {/* Title + Status */}
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-lg font-semibold text-gray-800">
                  {item.title}
                </h3>
                <span
                  className={`text-xs font-medium px-2 py-1 rounded-full border ${getStatusColor(
                    item.status
                  )}`}
                >
                  {item.status?.toUpperCase()}
                </span>
              </div>

              {/* Description */}
              <p className="text-sm text-gray-600 mb-2 line-clamp-2">
                {item.description}
              </p>

              <p className="text-xs text-gray-500 mb-3">
                📍 {item.location || "Unknown location"}
              </p>

              {/* Footer */}
              <div className="text-xs text-gray-400 flex justify-between items-center">
                <span>
                  {item.type === "found" ? "🔍 Found Item" : "❗ Lost Item"}
                </span>
                <span>
                  {new Date(item.updatedAt).toLocaleDateString()}{" "}
                  {new Date(item.updatedAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
