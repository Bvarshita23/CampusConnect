import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import toast from "react-hot-toast";

const EditUser = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [user, setUser] = useState(null);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState("");
  const [department, setDepartment] = useState("");
  const [year, setYear] = useState("");
  const [usn, setUsn] = useState("");

  // Load user details
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/auth/all-users", {
          headers: { Authorization: `Bearer ${token}` },
        });

        const list = res.data.users || res.data;
        const found = list.find((u) => u._id === id);

        if (!found) {
          toast.error("User not found");
          return navigate("/superadmin/dashboard");
        }

        setUser(found);
        setName(found.name || "");
        setEmail(found.email || "");
        setRole(found.role || "");
        setDepartment(found.department || "");
        setYear(found.year || "");
        setUsn(found.usn || "");
      } catch (err) {
        toast.error("Failed to load user");
        navigate("/superadmin/dashboard");
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [id, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) return;

    setSaving(true);

    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("name", name);
      formData.append("email", email);
      formData.append("role", role);
      formData.append("department", department || "");
      formData.append("year", year || "");
      formData.append("usn", usn || "");

      await axios.put(`/api/v1/auth/update/${user._id}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      toast.success("User updated successfully");
      navigate("/superadmin/dashboard");
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to update");
    } finally {
      setSaving(false);
    }
  };

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading user...</p>
      </div>
    );

  const isStudent = role === "student";
  const isFaculty = role === "faculty";

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start py-10">
      <form
        onSubmit={handleSubmit}
        className="bg-white rounded-2xl shadow-md w-full max-w-2xl p-6 space-y-4"
      >
        <h1 className="text-2xl font-bold text-sky-700 mb-2">
          Edit User – {user.name}
        </h1>

        {/* Name & Email */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Name
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Email
            </label>
            <input
              type="email"
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {/* Role & Department */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Role
            </label>
            <select
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="">Select role</option>
              <option value="student">Student</option>
              <option value="faculty">Faculty</option>
              <option value="admin">Admin</option>
              <option value="department_admin">Department Admin</option>
              <option value="functional_admin">Functional Admin</option>
              <option value="superadmin">Super Admin</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
            />
          </div>
        </div>

        {/* Student/Faculty fields */}
        {(isStudent || isFaculty) && (
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                {isStudent ? "USN" : "Faculty ID"}
              </label>
              <input
                className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                value={usn}
                onChange={(e) => setUsn(e.target.value.toUpperCase())}
              />
            </div>

            {isStudent && (
              <div>
                <label className="block text-sm font-medium text-gray-700">
                  Year
                </label>
                <input
                  className="mt-1 w-full border rounded-lg px-3 py-2 text-sm"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                />
              </div>
            )}
          </div>
        )}

        <div className="flex justify-end gap-3 pt-4">
          <button
            type="button"
            onClick={() => navigate("/superadmin/dashboard")}
            className="px-4 py-2 rounded-lg border border-gray-300 text-gray-700 text-sm"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="px-5 py-2 rounded-lg bg-sky-600 text-white text-sm font-semibold hover:bg-sky-700 disabled:opacity-60"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default EditUser;
