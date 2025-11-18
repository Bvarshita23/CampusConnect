import React, { useState } from "react";
import axios from "axios";
import { useParams, Link, useNavigate } from "react-router-dom";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  // Password strength checks
  const checks = {
    length: password.length >= 8,
    upper: /[A-Z]/.test(password),
    lower: /[a-z]/.test(password),
    number: /[0-9]/.test(password),
    special: /[@#$!%^&*(),.?":{}|<>]/.test(password),
  };

  const allValid = Object.values(checks).every(Boolean) && password === confirm;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage("");

    if (!allValid) {
      setMessage("❌ Password requirements not met.");
      return;
    }

    try {
      setLoading(true);

      const res = await axios.post(`/api/v1/auth/reset-password/${token}`, {
        password,
      });

      setMessage("✔ Password reset successful! Redirecting...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (err) {
      setMessage("❌ Invalid or expired reset link.");
    } finally {
      setLoading(false);
    }
  };

  const bullet = (ok) => (
    <span className={ok ? "text-green-600" : "text-red-500"}>
      {ok ? "✔" : "✘"}
    </span>
  );

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-sky-700 mb-6">
          Reset Password
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* New Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              New Password
            </label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Confirm Password */}
          <div>
            <label className="block text-sm font-medium mb-1">
              Confirm Password
            </label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300"
              value={confirm}
              onChange={(e) => setConfirm(e.target.value)}
              required
            />
            {confirm && password !== confirm && (
              <p className="text-red-500 text-sm mt-1">
                Passwords do not match
              </p>
            )}
          </div>

          {/* Password Strength */}
          <div className="text-sm bg-gray-50 p-3 rounded-lg border">
            <p className="font-semibold mb-1">Password must contain:</p>
            <p>{bullet(checks.length)} At least 8 characters</p>
            <p>{bullet(checks.upper)} One uppercase letter</p>
            <p>{bullet(checks.lower)} One lowercase letter</p>
            <p>{bullet(checks.number)} One number</p>
            <p>{bullet(checks.special)} One special character</p>
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
            disabled={!allValid || loading}
            className={`w-full py-3 rounded-xl font-semibold text-white ${
              allValid
                ? "bg-sky-600 hover:bg-sky-700"
                : "bg-gray-400 cursor-not-allowed"
            }`}
          >
            {loading ? "Resetting..." : "Reset Password"}
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
