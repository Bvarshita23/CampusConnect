import React, { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

export default function LoginPage() {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setErrorMessage("");

    try {
      setLoading(true);

      const res = await axios.post("/api/v1/auth/login", {
        email,
        password,
      });

      const { token, user } = res.data;

      localStorage.setItem("token", token);
      localStorage.setItem("user", JSON.stringify(user));

      // redirect based on role
      switch (user.role) {
        case "student":
          return navigate("/student/dashboard");
        case "faculty":
          return navigate("/faculty/dashboard");
        case "admin":
          return navigate("/admin/dashboard");
        case "department_admin":
          return navigate("/department-admin/dashboard");
        case "functional_admin":
          return navigate("/functional-admin/dashboard");
        case "superadmin":
          return navigate("/superadmin/dashboard");
        default:
          return navigate("/");
      }
    } catch (err) {
      const status = err?.response?.status;

      if (status === 404) {
        setErrorMessage("User not found");
      } else if (status === 401) {
        setErrorMessage("Incorrect password");
      } else {
        setErrorMessage("Login failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white shadow-xl p-8 rounded-2xl w-full max-w-md">
        <h2 className="text-3xl font-bold text-center text-sky-700 mb-6">
          CampusConnect Login
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              className="w-full p-3 rounded-lg border border-gray-300"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          {/* Password */}
          <div>
            <label className="block text-sm font-medium mb-1">Password</label>
            <input
              type="password"
              className="w-full p-3 rounded-lg border border-gray-300"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>

          {/* Error */}
          {errorMessage && (
            <p className="text-red-600 text-center text-sm">{errorMessage}</p>
          )}

          <button
            type="submit"
            disabled={loading}
            className={`w-full py-3 rounded-xl font-semibold text-white ${
              loading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-sky-600 hover:bg-sky-700"
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <div className="text-center mt-4">
            <Link
              className="text-sky-600 hover:underline"
              to="/forgot-password"
            >
              Forgot Password?
            </Link>
          </div>
        </form>
      </div>
    </div>
  );
}
