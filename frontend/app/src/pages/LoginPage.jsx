import React, { useState, useEffect } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import "./LoginPage.css";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("student");
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  // 🚀 If already logged in, redirect immediately by role
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));
    if (user?.role) {
      const userRole = user.role.toLowerCase();
      if (userRole === "admin") navigate("/admin/dashboard", { replace: true });
      else if (userRole === "faculty")
        navigate("/faculty/dashboard", { replace: true });
      else if (userRole === "student")
        navigate("/student/dashboard", { replace: true });
    }
  }, [navigate]);

  // 🔑 Handle login + role redirect
  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const res = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, role }),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Invalid credentials");
        return;
      }

      // ✅ Store session
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      toast.success("Login successful!");

      // ✅ Redirect by role
      const userRole = data.user.role?.toLowerCase();
      if (userRole === "admin") navigate("/admin/dashboard");
      else if (userRole === "faculty") navigate("/faculty/dashboard");
      else if (userRole === "student") navigate("/student/dashboard");
      else navigate("/");
    } catch (err) {
      console.error("❌ Login failed:", err);
      toast.error("Server error. Please try again later.");
    }
  };

  return (
    <div className="login-container">
      <Toaster position="top-center" />
      <div className="login-card">
        <h2 className="login-title">Campus Connect Login</h2>

        <form onSubmit={handleLogin} className="login-form">
          <label>Email</label>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <label>Role</label>
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="role-select"
          >
            <option value="student">Student</option>
            <option value="faculty">Faculty</option>
            <option value="admin">Admin</option>
          </select>

          <label>Password</label>
          <div className="password-wrapper">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="eye-icon"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          <div className="forgot-password">
            <a href="#">Forgot Password?</a>
          </div>

          <button type="submit" className="login-btn">
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
