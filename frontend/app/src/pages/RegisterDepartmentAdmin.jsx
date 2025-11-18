import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function RegisterDepartmentAdmin() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await axios.post(
        "/api/v1/auth/register",
        {
          ...form,
          role: "department_admin",
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      alert("Department Admin Registered Successfully!");
      navigate("/superadmin/dashboard");
    } catch (err) {
      alert(err.response?.data?.message || "Registration failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-center px-4">
      <div className="bg-white p-6 rounded-2xl shadow-md w-full max-w-lg">
        <h2 className="text-xl font-bold text-teal-700 mb-4">
          Register Department Admin
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <input
            type="text"
            name="name"
            placeholder="Admin Name"
            value={form.name}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <input
            type="email"
            name="email"
            placeholder="Email (must be @bitm.edu.in)"
            value={form.email}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Create Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          />

          <select
            name="department"
            value={form.department}
            onChange={handleChange}
            className="w-full px-3 py-2 border rounded-lg"
            required
          >
            <option value="">Select Department</option>
            <option>CSE</option>
            <option>ISE</option>
            <option>AIML</option>
            <option>ECE</option>
            <option>EEE</option>
            <option>ME</option>
            <option>CIVIL</option>
          </select>

          <button
            disabled={loading}
            className="w-full bg-teal-600 text-white py-2 rounded-lg hover:bg-teal-700"
          >
            {loading ? "Registering..." : "Register Department Admin"}
          </button>
        </form>

        <button
          onClick={() => navigate(-1)}
          className="mt-4 text-sm text-gray-600 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}
