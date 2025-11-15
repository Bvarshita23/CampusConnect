import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await axios.post("/api/v1/auth/forgot-password", { email });

      toast.success("Password reset link sent to your email!");
      setEmail("");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to send reset link");
    }

    setLoading(false);
  };

  return (
    <div className="flex justify-center items-center h-screen bg-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl p-8 rounded-xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-blue-700 mb-3">
          Forgot Password
        </h1>

        <p className="text-gray-600 text-sm mb-4">
          Enter your email to receive a password reset link.
        </p>

        {/* Email Input */}
        <input
          type="email"
          placeholder="Enter your registered email"
          className="w-full border border-gray-300 rounded-lg p-3 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Submit Button */}
        <button
          className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition"
          disabled={loading}
        >
          {loading ? "Sending..." : "Send Reset Link"}
        </button>
      </form>
    </div>
  );
}
