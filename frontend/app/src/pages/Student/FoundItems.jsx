import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ConfirmDialog from "../../components/ConfirmDialog";

export default function FoundItems() {
  const [items, setItems] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [deleteId, setDeleteId] = useState(null);
  const [verifyItem, setVerifyItem] = useState(null);
  const [selectedAnswer, setSelectedAnswer] = useState("");

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  const fetchItems = async () => {
    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/lostfound?type=found&search=${encodeURIComponent(
          searchTerm || ""
        )}`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const data = await res.json();
      if (data.success) setItems(data.items || []);
      else throw new Error(data.message);
    } catch {
      toast.error("Failed to load found items.");
    }
  };

  useEffect(() => {
    fetchItems();
  }, [searchTerm]);

  const handleVerifySubmit = async () => {
    if (!selectedAnswer.trim()) {
      toast.error("Please select an answer.");
      return;
    }

    try {
      const res = await fetch(
        `http://localhost:8080/api/v1/lostfound/${verifyItem._id}/verify`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ selectedAnswer }),
        }
      );
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("✅ Ownership verified!");
      setItems((prev) => prev.filter((it) => it._id !== verifyItem._id));
      setVerifyItem(null);
    } catch {
      toast.error("Verification failed.");
    }
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`http://localhost:8080/api/v1/lostfound/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!data.success) throw new Error(data.message);
      toast.success("Item deleted");
      setItems((prev) => prev.filter((it) => it._id !== id));
    } catch {
      toast.error("Failed to delete item");
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "available":
        return "bg-green-100 text-green-700";
      case "matched":
        return "bg-blue-100 text-blue-700";
      case "claimed":
        return "bg-yellow-100 text-yellow-700";
      case "returned":
        return "bg-purple-100 text-purple-700";
      case "rejected":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-600";
    }
  };

  return (
    <section>
      <h2 className="text-2xl sm:text-3xl font-semibold text-[#0A66C2] mb-6">
        📦 Found Items
      </h2>

      {/* 🔍 Search Bar with Clear (❌) */}
      <div className="relative mb-6 max-w-md">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          placeholder="Search by title or location..."
          className="w-full border rounded-lg pl-4 pr-10 py-2 focus:ring-2 focus:ring-[#0A66C2] outline-none"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="absolute right-3 top-2.5 text-gray-500 hover:text-gray-700"
          >
            ✖
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <p className="text-gray-500">No found items yet.</p>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {items.map((item) => (
            <div
              key={item._id}
              className="bg-white rounded-xl shadow-md border border-gray-100 p-4 transition hover:shadow-lg"
            >
              {item.imageUrl && (
                <img
                  src={`http://localhost:8080${item.imageUrl}`}
                  alt={item.title}
                  className="w-full h-40 object-cover rounded-lg mb-3"
                />
              )}

              <div className="flex justify-between mb-2">
                <span className="text-xs px-2 py-1 rounded-md bg-green-100 text-green-700">
                  FOUND
                </span>
                <span
                  className={`text-[11px] px-2 py-1 rounded-md ${getStatusColor(
                    item.status || "available"
                  )}`}
                >
                  {(item.status || "available").toUpperCase()}
                </span>
              </div>

              <h3 className="text-lg font-semibold">{item.title}</h3>
              <p className="text-sm text-gray-600 line-clamp-2 mt-1">
                {item.description}
              </p>
              <p className="text-sm text-gray-500 mt-1">📍 {item.location}</p>

              <div className="mt-4 flex gap-2">
                <button
                  onClick={() => setVerifyItem(item)}
                  className="flex-1 bg-[#0A66C2] text-white py-2 rounded-lg hover:bg-[#004182] transition"
                >
                  Claim Item
                </button>
                {item.postedBy?._id === user?._id && (
                  <button
                    onClick={() => {
                      setDeleteId(item._id);
                      setConfirmOpen(true);
                    }}
                    className="px-4 py-2 text-red-600 border rounded-lg hover:bg-red-50"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* 🧾 Custom Verify Modal */}
      {verifyItem && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-[90%] max-w-md shadow-xl">
            <h3 className="text-lg font-semibold text-[#0A66C2] mb-4 text-center">
              Verify Ownership
            </h3>
            <p className="text-gray-700 font-medium mb-3">
              {verifyItem.uniqueQuestion}
            </p>

            {verifyItem.options?.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center gap-2 mb-2 text-gray-700"
              >
                <input
                  type="radio"
                  name="verifyOption"
                  value={opt}
                  checked={selectedAnswer === opt}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                />
                {opt}
              </label>
            ))}

            <div className="flex justify-end gap-3 mt-4">
              <button
                onClick={() => setVerifyItem(null)}
                className="px-4 py-2 border rounded-lg hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifySubmit}
                className="px-4 py-2 bg-[#0A66C2] text-white rounded-lg hover:bg-[#004182]"
              >
                Submit
              </button>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={() => handleDelete(deleteId)}
        title="Delete Item"
        message="Are you sure you want to delete this item? This action cannot be undone."
      />
    </section>
  );
}
