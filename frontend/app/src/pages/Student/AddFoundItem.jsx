import React, { useState } from "react";
import toast, { Toaster } from "react-hot-toast";

export default function AddFoundItem({ onItemAdded }) {
  const [form, setForm] = useState({
    type: "found",
    title: "",
    description: "",
    location: "",
    image: null,
    uniqueQuestion: "",
    options: ["", "", "", ""],
    correctAnswer: "",
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleOptionChange = (index, value) => {
    const updated = [...form.options];
    updated[index] = value;
    setForm({ ...form, options: updated });
  };

  const handleFileChange = (e) => {
    setForm({ ...form, image: e.target.files[0] });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      const data = new FormData();

      Object.entries(form).forEach(([key, value]) => {
        if (key === "options") data.append(key, JSON.stringify(value));
        else data.append(key, value);
      });

      const res = await fetch("http://localhost:8080/api/v1/lostfound", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: data,
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.message);

      toast.success("✅ Item added successfully!");
      setForm({
        type: "found",
        title: "",
        description: "",
        location: "",
        image: null,
        uniqueQuestion: "",
        options: ["", "", "", ""],
        correctAnswer: "",
      });

      // trigger refresh in dashboard if callback exists
      if (onItemAdded) onItemAdded();
    } catch (error) {
      toast.error(error.message || "Failed to add item.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100 flex justify-center">
      <Toaster position="top-center" />
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-lg rounded-xl p-6 w-full max-w-lg"
      >
        <h2 className="text-2xl font-bold text-[#0A66C2] mb-4 text-center">
          🧾 Add Lost / Found Item
        </h2>
        {/* Type */}
        <label className="block text-gray-600 font-medium">Type</label>
        const [type] = useState("found");
        {/* Title */}
        <label className="block text-gray-600 font-medium">Title</label>
        <input
          name="title"
          value={form.title}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        {/* Description */}
        <label className="block text-gray-600 font-medium">Description</label>
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        {/* Location */}
        <label className="block text-gray-600 font-medium">Location</label>
        <input
          name="location"
          value={form.location}
          onChange={handleChange}
          required
          className="w-full border rounded-lg px-3 py-2 mb-3"
        />
        {/* Conditional Question Section */}
        {form.type === "found" && (
          <>
            <label className="block text-gray-600 font-medium">
              Verification Question
            </label>
            <input
              name="uniqueQuestion"
              value={form.uniqueQuestion}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />

            {form.options.map((opt, idx) => (
              <input
                key={idx}
                placeholder={`Option ${idx + 1}`}
                value={opt}
                onChange={(e) => handleOptionChange(idx, e.target.value)}
                className="w-full border rounded-lg px-3 py-2 mb-2"
              />
            ))}

            <label className="block text-gray-600 font-medium">
              Correct Answer
            </label>
            <input
              name="correctAnswer"
              value={form.correctAnswer}
              onChange={handleChange}
              className="w-full border rounded-lg px-3 py-2 mb-3"
            />
          </>
        )}
        {/* Image Upload */}
        <label className="block text-gray-600 font-medium">Upload Image</label>
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="w-full mb-4"
        />
        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#0A66C2] text-white font-semibold py-2 rounded-lg hover:bg-[#004182] transition disabled:opacity-60"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
