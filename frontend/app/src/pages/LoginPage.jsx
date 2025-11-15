import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("/api/v1/auth/login", {
        email,
        password,
      });

      const { user, token } = res.data;

      // Save user + token
      localStorage.setItem("user", JSON.stringify(user));
      localStorage.setItem("token", token);

      toast.success("Login successful!");

      // Redirect based on ACTUAL role from backend
      switch (user.role) {
        case "superadmin":
          navigate("/superadmin/dashboard");
          break;

        case "department_admin":
          navigate("/department-admin/dashboard");
          break;

        case "functional_admin":
          navigate("/functional-admin/dashboard");
          break;

        case "admin":
          navigate("/admin/dashboard");
          break;

        case "faculty":
          navigate("/faculty/dashboard");
          break;

        case "student":
          navigate("/student/dashboard");
          break;

        default:
          navigate("/dashboard");
      }
    } catch (err) {
      console.error(err);
      toast.error("Invalid email or password");
    }

    setLoading(false);
  };

  return (
    <div className="w-full h-screen flex justify-center items-center bg-blue-50">
      <form
        onSubmit={handleLogin}
        className="bg-white shadow-xl rounded-xl p-8 w-full max-w-md"
      >
        <h2 className="text-3xl font-bold text-center text-blue-700 mb-6">
          Campus Connect Login
        </h2>

        {/* Email */}
        <input
          type="email"
          placeholder="Email"
          className="w-full border border-gray-300 rounded-md p-3 mb-4"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />

        {/* Password */}
        <input
          type="password"
          placeholder="Password"
          className="w-full border border-gray-300 rounded-md p-3 mb-4"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />

        {/* Login Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-semibold"
        >
          {loading ? "Logging in..." : "Login"}
        </button>

        <p
          className="text-center text-sm text-blue-600 mt-4 cursor-pointer"
          onClick={() => navigate("/forgot-password")}
        >
          Forgot Password?
        </p>
      </form>
    </div>
  );
}
