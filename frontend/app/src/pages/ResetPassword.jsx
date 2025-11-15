import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import toast from "react-hot-toast";

export default function ResetPassword() {
  const { token } = useParams();
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) return toast.error("Passwords do not match");

    try {
      await axios.post(`/api/v1/auth/reset-password/${token}`, {
        password,
      });

      toast.success("Password reset successful!");
      navigate("/login");
    } catch (err) {
      toast.error("Reset failed. Link may be expired.");
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-blue-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white shadow-xl p-8 rounded-xl w-full max-w-md"
      >
        <h1 className="text-2xl font-bold text-blue-700 mb-4">
          Reset Password
        </h1>

        <input
          type="password"
          className="w-full p-3 border mb-4 rounded"
          placeholder="New Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          className="w-full p-3 border mb-4 rounded"
          placeholder="Confirm Password"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button
          type="submit"
          className="w-full bg-blue-600 text-white p-3 rounded-lg"
        >
          Reset Password
        </button>
      </form>
    </div>
  );
}
