import React, { useState } from "react";
import axios from "axios";
import { Link } from "react-router-dom";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [checking, setChecking] = useState(false);
  const [emailValid, setEmailValid] = useState(null);
  const [message, setMessage] = useState("");

  const checkEmailExists = async (email) => {
    if (!email) return;

    setChecking(true);
    try {
      const res = await axios.post("/api/v1/auth/check-email", { email });
      setEmailValid(res.data.exists);
    } catch {
      setEmailValid(false);
    }
    setChecking(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!emailValid) {
      setMessage("❌ This email is not registered.");
      return;
    }

    try {
      const res = await axios.post("/api/v1/auth/forgot-password", { email });
      setMessage("✔ Reset link sent to your email.");
    } catch (err) {
      setMessage("❌ Failed to send reset link.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 max-w-md w-full">
        <h2 className="text-3xl font-bold text-center text-sky-700 mb-6">
          Forgot Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Enter your email
            </label>
            <input
              type="email"
              className={`w-full p-3 rounded-lg border ${
                emailValid === false
                  ? "border-red-500"
                  : emailValid === true
                  ? "border-green-500"
                  : "border-gray-300"
              }`}
              value={email}
              onChange={(e) => {
                setEmail(e.target.value);
                setEmailValid(null);
              }}
              onBlur={() => checkEmailExists(email)}
              required
            />

            {/* Checking message */}
            {checking && (
              <p className="text-sm text-gray-500 mt-1">Checking...</p>
            )}

            {/* Error */}
            {emailValid === false && (
              <p className="text-sm text-red-500 mt-1">Email not registered.</p>
            )}
            {emailValid === true && (
              <p className="text-sm text-green-600 mt-1">Email found ✓</p>
            )}
          </div>

          {/* Message */}
          {message && (
            <p
              className={`text-center font-medium ${
                message.startsWith("✔") ? "text-green-600" : "text-red-600"
              }`}
            >
              {message}
            </p>
          )}

          {/* Submit */}
          <button
            type="submit"
            disabled={checking}
            className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition"
          >
            Send Reset Link
          </button>

          <div className="text-center mt-4">
            <Link to="/login" className="text-sky-600 hover:underline">
              ← Back to Login
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
