// frontend/src/pages/AdminDashboard.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Users, Plus, X, Trash2, Pencil, Upload, Filter, FolderSearch, ClipboardList } from "lucide-react";
import DashboardLayout from "../components/DashboardLayout";
import axios from "../api/axiosConfig";
const API_BASE = "http://localhost:8080/api/v1"; // ✅ backend base
const FILE_BASE = "http://localhost:8080"; // ✅ file server base
//const res = await axios.post("/api/v1/auth/register", formData, {
//headers: { Authorization: `Bearer ${token}` },
//});

// Branch options
const BRANCHES = [
  "CSE",
  "AIML",
  "CIVIL",
  "ECE",
  "MEC",
  "EEE",
  "CS/AI",
  "CS/DS",
];

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  const [loadingUsers, setLoadingUsers] = useState(true);

  const [roleFilter, setRoleFilter] = useState("all");
  const [branchFilter, setBranchFilter] = useState("");
  const [yearFilter, setYearFilter] = useState("");

  const [showAdd, setShowAdd] = useState(false);
  const [previewImage, setPreviewImage] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    role: "student",
    department: "",
    year: "",
    usn: "",
    photo: null,
  });

  const [showEdit, setShowEdit] = useState(false);
  const [edit, setEdit] = useState(null);
  const [editPreview, setEditPreview] = useState(null);

  const imgSrc = (u) =>
    u?.photo ? `${FILE_BASE}${u.photo}` : "https://i.pravatar.cc/100";

  const resetAddForm = () => {
    setForm({
      name: "",
      email: "",
      password: "",
      role: "student",
      department: "",
      year: "",
      usn: "",
      photo: null,
    });
    setPreviewImage(null);
  };

  // ✅ Fetch users (with auth header)
  const fetchUsers = async () => {
    try {
      setLoadingUsers(true);
      const token = localStorage.getItem("token"); // stored at login
      const res = await fetch(`${API_BASE}/auth/all-users`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.message);
      setUsers(data.users || []);
    } catch (e) {
      console.error("Fetch users error:", e);
      alert(
        "❌ Failed to load users. Make sure you're logged in as admin/superadmin."
      );
    } finally {
      setLoadingUsers(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // ===== Filtered users
  const filteredUsers = useMemo(() => {
    return users.filter((u) => {
      const roleOk = roleFilter === "all" ? true : u.role === roleFilter;
      const branchOk = branchFilter ? u.department === branchFilter : true;
      const yearOk = yearFilter ? u.year === yearFilter : true;
      return roleOk && branchOk && yearOk;
    });
  }, [users, roleFilter, branchFilter, yearFilter]);

  // ===== Add new user
  const handleAddChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files?.[0];
      setForm((p) => ({ ...p, photo: file || null }));
      setPreviewImage(file ? URL.createObjectURL(file) : null);
    } else {
      setForm((p) => ({ ...p, [name]: value }));
    }
  };

  const handleAddSubmit = async (e) => {
    e.preventDefault();

    try {
      const formData = new FormData(); // ✅ define it here first
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("role", form.role);
      formData.append("department", form.department);
      formData.append("year", form.year);
      if (form.photo) formData.append("photo", form.photo);

      const token = localStorage.getItem("token");

      const res = await fetch(`${API_BASE}/auth/register`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });

      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`⚠️ ${data.message || "Error adding user"}`);
        return;
      }

      alert(`✅ ${form.role} added successfully!`);
      setUsers((prev) => [...prev, data.user]);
      setShowAdd(false);
      resetAddForm();
    } catch (err) {
      console.error("Add user error:", err);
      alert("❌ Server error while adding user.");
    }
  };

  // ===== Delete user
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this user?")) return;
    try {
      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/auth/delete/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`⚠️ ${data?.message || "Failed to delete user"}`);
        return;
      }
      setUsers((prev) => prev.filter((u) => u._id !== id));
      alert("🗑️ User deleted.");
    } catch (err) {
      console.error("Delete error:", err);
      alert("❌ Failed to delete user.");
    }
  };

  // ===== Edit modal logic
  const openEdit = (u) => {
    setEdit({
      _id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      department: u.department || "",
      year: u.year || "",
      usn: u.usn || "",
      photo: null,
      currentPhoto: u.photo || null,
    });
    setEditPreview(u.photo ? `${FILE_BASE}${u.photo}` : null);
    setShowEdit(true);
  };

  const handleEditChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "photo") {
      const file = files?.[0];
      setEdit((p) => ({ ...p, photo: file || null }));
      setEditPreview(file ? URL.createObjectURL(file) : p.currentPhoto);
    } else {
      setEdit((p) => ({ ...p, [name]: value }));
    }
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    try {
      const fd = new FormData();
      fd.append("name", edit.name.trim());
      fd.append("email", edit.email.trim());
      fd.append("role", (edit.role || "student").toLowerCase());
      if (edit.department) fd.append("department", edit.department);
      if (edit.role === "student" && edit.year) fd.append("year", edit.year);
      if (edit.role === "student" && edit.usn)
        fd.append("usn", edit.usn.trim());
      if (edit.photo instanceof File) fd.append("photo", edit.photo);

      const token = localStorage.getItem("token");
      const res = await fetch(`${API_BASE}/auth/update/${edit._id}`, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      const data = await res.json();
      if (!res.ok || !data.success) {
        alert(`⚠️ ${data?.message || "Failed to update user"}`);
        return;
      }

      alert("✅ User updated.");
      setUsers((prev) =>
        prev.map((u) => (u._id === data.user._id ? data.user : u))
      );
      setShowEdit(false);
      setEdit(null);
      setEditPreview(null);
    } catch (err) {
      console.error("Update error:", err);
      alert("❌ Server error while updating user.");
    }
  };

  // ===== UI
  return (
    <DashboardLayout title="Admin Dashboard">
      <motion.div
        className="max-w-7xl mx-auto space-y-8"
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {/* ===== Header ===== */}
        <div className="flex items-center justify-between">
          <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-3xl shadow-2xl p-6 flex items-center justify-between flex-1 mr-6">
            <div>
              <h2 className="text-2xl font-bold">Campus Admin</h2>
              <p className="text-white/80 text-sm">Role: Administrator</p>
              <p className="text-white/80 text-sm">
                Department: Management Office
              </p>
            </div>
            <img
              src="https://i.pravatar.cc/120?img=15"
              alt="Admin"
              className="w-16 h-16 rounded-full border-4 border-white object-cover"
            />
          </div>

          <motion.button
            onClick={() => setShowAdd(true)}
            whileHover={{ scale: 1.03 }}
            className="bg-gradient-to-r from-emerald-500 to-green-600 text-white px-5 py-3 rounded-xl shadow-lg flex items-center gap-2"
          >
            <Plus size={18} />
            Add New User
          </motion.button>
        </div>

        {/* ===== Quick Access Cards ===== */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/admin/lostfound")}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <FolderSearch size={32} className="mb-3" />
            <h3 className="text-xl font-semibold mb-2">Lost & Found</h3>
            <p className="text-white/80 text-sm">Report or claim lost items</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/admin/availability")}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <Users size={32} className="mb-3" />
            <h3 className="text-xl font-semibold mb-2">Faculty Finder</h3>
            <p className="text-white/80 text-sm">Find and connect with faculty</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/admin/report-problem")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <ClipboardList size={32} className="mb-3" />
            <h3 className="text-xl font-semibold mb-2">Report Problem</h3>
            <p className="text-white/80 text-sm">Report campus issues</p>
          </motion.div>
        </motion.div>

        {/* ===== Filters ===== */}
        <div className="bg-white rounded-2xl p-4 shadow border border-blue-100 flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 text-blue-700 font-medium">
            <Filter size={18} />
            Filters
          </div>
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="all">All Roles</option>
            <option value="student">Students</option>
            <option value="faculty">Faculty</option>
          </select>
          <select
            value={branchFilter}
            onChange={(e) => setBranchFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Branches</option>
            {BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>
          <select
            value={yearFilter}
            onChange={(e) => setYearFilter(e.target.value)}
            className="px-3 py-2 border rounded-lg"
          >
            <option value="">All Years</option>
            {["1", "2", "3", "4"].map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </div>

        {/* ===== Table ===== */}
        <div className="bg-white rounded-3xl p-6 shadow-xl border border-blue-100">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Users size={20} className="text-blue-600" /> Manage Users
            </h3>
            <div className="text-sm text-gray-500">
              Total: <span className="font-medium">{filteredUsers.length}</span>
            </div>
          </div>

          {loadingUsers ? (
            <p className="text-center text-gray-500">Loading users...</p>
          ) : filteredUsers.length === 0 ? (
            <div className="text-center text-gray-500 py-10">
              No users found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="border-b text-gray-500">
                    <th className="text-left py-2">Photo</th>
                    <th className="text-left">Name</th>
                    <th className="text-left">Email</th>
                    <th className="text-left">USN</th>
                    <th className="text-left">Role</th>
                    <th className="text-left">Department</th>
                    <th className="text-left">Year</th>
                    <th className="text-left">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredUsers.map((u) => (
                    <tr key={u._id} className="border-b hover:bg-blue-50">
                      <td className="py-2">
                        <img
                          src={imgSrc(u)}
                          alt="user"
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      </td>
                      <td>{u.name}</td>
                      <td>{u.email}</td>
                      <td>{u.usn || "-"}</td>
                      <td className="capitalize">{u.role}</td>
                      <td>{u.department || "-"}</td>
                      <td>{u.role === "student" ? u.year || "-" : "-"}</td>
                      <td className="flex gap-3 py-2">
                        <button
                          onClick={() => openEdit(u)}
                          className="text-blue-600 hover:text-blue-800"
                        >
                          <Pencil size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(u._id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={18} />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </motion.div>

      {/* ===== Add User Modal ===== */}
      <AnimatePresence>
        {showAdd && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-7 rounded-3xl shadow-2xl w-[90%] max-w-lg relative"
              initial={{ scale: 0.9, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -10 }}
            >
              <button
                onClick={() => {
                  setShowAdd(false);
                  resetAddForm();
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-semibold text-blue-700 mb-4">
                Add New User
              </h2>

              {previewImage && (
                <div className="flex justify-center mb-3">
                  <img
                    src={previewImage}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow"
                  />
                </div>
              )}

              <form onSubmit={handleAddSubmit} className="space-y-3">
                <input
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleAddChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  name="email"
                  placeholder="Email"
                  type="email"
                  value={form.email}
                  onChange={handleAddChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  name="password"
                  placeholder="Password"
                  type="password"
                  value={form.password}
                  onChange={handleAddChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                />

                <select
                  name="role"
                  value={form.role}
                  onChange={handleAddChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>

                <select
                  name="department"
                  value={form.department}
                  onChange={handleAddChange}
                  required
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Branch/Department</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {form.role === "student" && (
                  <>
                    <input
                      name="usn"
                      placeholder="USN"
                      value={form.usn}
                      onChange={handleAddChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <select
                      name="year"
                      value={form.year}
                      onChange={handleAddChange}
                      required
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select Year</option>
                      {["1", "2", "3", "4"].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <label className="flex items-center gap-3 border px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50">
                  <Upload size={18} className="text-blue-600" />
                  <span>{form.photo ? form.photo.name : "Upload Photo"}</span>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleAddChange}
                    hidden
                  />
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg mt-2 shadow"
                >
                  Add User
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ===== Edit User Modal ===== */}
      <AnimatePresence>
        {showEdit && (
          <motion.div
            className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className="bg-white p-7 rounded-3xl shadow-2xl w-[90%] max-w-lg relative"
              initial={{ scale: 0.9, y: -10 }}
              animate={{ scale: 1, y: 0 }}
              exit={{ scale: 0.9, y: -10 }}
            >
              <button
                onClick={() => {
                  setShowEdit(false);
                  setEdit(null);
                  setEditPreview(null);
                }}
                className="absolute top-4 right-4 text-gray-600 hover:text-red-500"
              >
                <X size={22} />
              </button>

              <h2 className="text-2xl font-semibold text-blue-700 mb-4">
                Edit User
              </h2>

              {editPreview && (
                <div className="flex justify-center mb-3">
                  <img
                    src={editPreview}
                    alt="Preview"
                    className="w-24 h-24 rounded-full object-cover border-4 border-blue-200 shadow"
                  />
                </div>
              )}

              <form onSubmit={handleEditSubmit} className="space-y-3">
                <input
                  name="name"
                  value={edit?.name || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <input
                  name="email"
                  value={edit?.email || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border rounded-lg"
                />
                <select
                  name="role"
                  value={edit?.role || "student"}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="student">Student</option>
                  <option value="faculty">Faculty</option>
                </select>

                <select
                  name="department"
                  value={edit?.department || ""}
                  onChange={handleEditChange}
                  className="w-full px-4 py-2 border rounded-lg"
                >
                  <option value="">Select Branch/Department</option>
                  {BRANCHES.map((b) => (
                    <option key={b} value={b}>
                      {b}
                    </option>
                  ))}
                </select>

                {edit?.role === "student" && (
                  <>
                    <input
                      name="usn"
                      placeholder="USN"
                      value={edit?.usn || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border rounded-lg"
                    />
                    <select
                      name="year"
                      value={edit?.year || ""}
                      onChange={handleEditChange}
                      className="w-full px-4 py-2 border rounded-lg"
                    >
                      <option value="">Select Year</option>
                      {["1", "2", "3", "4"].map((y) => (
                        <option key={y} value={y}>
                          {y}
                        </option>
                      ))}
                    </select>
                  </>
                )}

                <label className="flex items-center gap-3 border px-4 py-2 rounded-lg cursor-pointer hover:bg-blue-50">
                  <Upload size={18} className="text-blue-600" />
                  <span>
                    {edit?.photo instanceof File
                      ? edit.photo.name
                      : "Change Photo"}
                  </span>
                  <input
                    type="file"
                    name="photo"
                    accept="image/*"
                    onChange={handleEditChange}
                    hidden
                  />
                </label>

                <motion.button
                  whileHover={{ scale: 1.02 }}
                  className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2 rounded-lg mt-2 shadow"
                >
                  Save Changes
                </motion.button>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
