import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ClaimModal({ item, onClose }) {
  const [answer, setAnswer] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        `http://localhost:8080/api/v1/lostfound/verify-claim/${item._id}`,
        { answer },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (res.data.success) toast.success("Ownership verified successfully!");
      else toast.error(res.data.message || "Verification failed");
      onClose();
    } catch (err) {
      toast.error("Error verifying ownership");
      console.error(err);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center z-50 bg-black bg-opacity-50">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[90%] max-w-md relative">
        <button
          onClick={onClose}
          className="absolute top-3 right-3 text-gray-500 hover:text-gray-700 text-xl"
        >
          ✕
        </button>

        <h2 className="text-xl font-bold text-[#0A66C2] text-center mb-4">
          Verify Ownership 🧾
        </h2>
        <p className="text-center text-gray-600 mb-4">{item.uniqueQuestion}</p>

        <form onSubmit={handleSubmit}>
          {item.options?.map((opt, index) => (
            <label
              key={index}
              className="flex items-center gap-2 border rounded-lg p-2 mb-2 cursor-pointer hover:bg-gray-50"
            >
              <input
                type="radio"
                name="answer"
                value={opt}
                checked={answer === opt}
                onChange={() => setAnswer(opt)}
              />
              {opt}
            </label>
          ))}
          <button
            type="submit"
            className="w-full bg-[#0A66C2] text-white py-2 rounded-lg mt-3 hover:bg-[#004182] transition"
          >
            Submit Answer
          </button>
        </form>
      </div>
    </div>
  );
}
