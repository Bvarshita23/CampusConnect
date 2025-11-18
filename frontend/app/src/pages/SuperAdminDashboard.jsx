// frontend/app/src/pages/SuperAdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Link, useNavigate } from "react-router-dom";
import {
  Users,
  UserCheck,
  Shield,
  AlertTriangle,
  PackageSearch,
  Calendar,
  Upload,
  UserPlus,
  GraduationCap,
  UserCog,
  Edit3,
  Trash2,
} from "lucide-react";

import Navbar from "../components/Navbar";

export default function SuperAdminDashboard() {
  const [loading, setLoading] = useState(true);
  const [allUsers, setAllUsers] = useState([]);

  // SEARCH
  const [studentSearch, setStudentSearch] = useState("");
  const [facultySearch, setFacultySearch] = useState("");
  const [adminSearch, setAdminSearch] = useState("");

  // SORT
  const [studentSort, setStudentSort] = useState({ key: "name", dir: "asc" });
  const [facultySort, setFacultySort] = useState({ key: "name", dir: "asc" });
  const [adminSort, setAdminSort] = useState({ key: "name", dir: "asc" });

  const navigate = useNavigate();

  // FILTER STATES
  const [studentDeptFilter, setStudentDeptFilter] = useState("");
  const [studentYearFilter, setStudentYearFilter] = useState("");

  const [facultyDeptFilter, setFacultyDeptFilter] = useState("");

  const [adminDeptFilter, setAdminDeptFilter] = useState("");
  const [adminRoleFilter, setAdminRoleFilter] = useState("");

  // FETCH USERS
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get("/api/v1/auth/all-users", {
          headers: { Authorization: `Bearer ${token}` },
        });
        setAllUsers(res.data.users || res.data);
      } catch (err) {
        toast.error("Failed to load users");
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, []);

  // SORTING FUNCTION
  const sortUsers = (list, sortCfg) => {
    const { key, dir } = sortCfg;
    return [...list].sort((a, b) => {
      const va = (a[key] || "").toString().toLowerCase();
      const vb = (b[key] || "").toString().toLowerCase();

      if (va < vb) return dir === "asc" ? -1 : 1;
      if (va > vb) return dir === "asc" ? 1 : -1;
      return 0;
    });
  };

  const handleSort = (table, key) => {
    const setter =
      table === "students"
        ? setStudentSort
        : table === "faculty"
        ? setFacultySort
        : setAdminSort;

    setter((prev) =>
      prev.key === key
        ? { key, dir: prev.dir === "asc" ? "desc" : "asc" }
        : { key, dir: "asc" }
    );
  };

  const sortLabel = (sortCfg, key) =>
    sortCfg.key === key ? (sortCfg.dir === "asc" ? "↑" : "↓") : "";

  // FILTERING LOGIC
  const filterStudents = () =>
    allUsers
      .filter((u) => u.role === "student")
      .filter((u) =>
        studentDeptFilter ? u.department === studentDeptFilter : true
      )
      .filter((u) =>
        studentYearFilter ? String(u.year) === studentYearFilter : true
      )
      .filter((u) =>
        studentSearch
          ? (u.name + u.email + u.usn + u.year + u.department)
              .toLowerCase()
              .includes(studentSearch.toLowerCase())
          : true
      );

  const filterFaculty = () =>
    allUsers
      .filter((u) => u.role === "faculty")
      .filter((u) =>
        facultyDeptFilter ? u.department === facultyDeptFilter : true
      )
      .filter((u) =>
        facultySearch
          ? (u.name + u.email + u.usn + u.department)
              .toLowerCase()
              .includes(facultySearch.toLowerCase())
          : true
      );

  const filterAdmins = () =>
    allUsers
      .filter((u) =>
        [
          "superadmin",
          "admin",
          "department_admin",
          "functional_admin",
        ].includes(u.role)
      )
      .filter((u) =>
        adminDeptFilter ? u.department === adminDeptFilter : true
      )
      .filter((u) => (adminRoleFilter ? u.role === adminRoleFilter : true))
      .filter((u) =>
        adminSearch
          ? (u.name + u.email + u.role + u.department)
              .toLowerCase()
              .includes(adminSearch.toLowerCase())
          : true
      );

  // APPLY FILTER + SORT
  const students = sortUsers(filterStudents(), studentSort);
  const faculty = sortUsers(filterFaculty(), facultySort);
  const admins = sortUsers(filterAdmins(), adminSort);

  // ACTIONS
  const handleEditUser = (id) => navigate(`/superadmin/edit-user/${id}`);

  const handleDeleteUser = async (id) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const token = localStorage.getItem("token");
      await axios.delete(`/api/v1/auth/delete/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setAllUsers((prev) => prev.filter((u) => u._id !== id));
      toast.success("User deleted");
    } catch (err) {
      toast.error("Failed to delete user");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-gray-600 text-lg">Loading dashboard...</p>
      </div>
    );
  }

  return (
    <div className="bg-gray-100 min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-4 py-6 space-y-8">
        {/* ----------------------------- */}
        {/* -------- STUDENTS ----------- */}
        {/* ----------------------------- */}
        {/* NAVIGATION CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            to="/superadmin/lostfound"
            className="bg-white rounded-2xl p-4 flex items-center gap-4 hover:bg-sky-50 border shadow-sm"
          >
            <div className="w-10 h-10 bg-sky-100 text-sky-600 rounded-xl flex items-center justify-center">
              <PackageSearch size={20} />
            </div>
            <div>
              <p className="font-semibold text-sky-800">Lost & Found</p>
              <p className="text-xs text-gray-500">Manage all items</p>
            </div>
          </Link>

          <Link
            to="/superadmin/report-problem"
            className="bg-white rounded-2xl p-4 flex items-center gap-4 hover:bg-rose-50 border shadow-sm"
          >
            <div className="w-10 h-10 bg-rose-100 text-rose-600 rounded-xl flex items-center justify-center">
              <AlertTriangle size={20} />
            </div>
            <div>
              <p className="font-semibold text-rose-600">Problem Reporting</p>
              <p className="text-xs text-gray-500">Monitor issues</p>
            </div>
          </Link>

          <Link
            to="/superadmin/availability"
            className="bg-white rounded-2xl p-4 flex items-center gap-4 hover:bg-emerald-50 border shadow-sm"
          >
            <div className="w-10 h-10 bg-emerald-100 text-emerald-700 rounded-xl flex items-center justify-center">
              <Calendar size={20} />
            </div>
            <div>
              <p className="font-semibold text-emerald-700">
                Faculty Availability
              </p>
              <p className="text-xs text-gray-500">Check schedules</p>
            </div>
          </Link>
        </section>
        {/* QUICK ACTIONS */}
        <section className="bg-white p-5 rounded-2xl border shadow-sm">
          <h2 className="text-lg font-semibold text-gray-800 mb-3">
            Quick Actions
          </h2>

          <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-4">
            {/* Bulk Students */}
            <button
              onClick={() => navigate("/superadmin/bulk-upload/students")}
              className="bg-sky-50 hover:bg-sky-100 border rounded-2xl p-4 flex gap-3"
            >
              <div className="p-2 bg-sky-600 text-white rounded-xl">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-sky-800">
                  Bulk Upload – Students
                </p>
                <p className="text-[11px] text-sky-600/80">ZIP upload</p>
              </div>
            </button>

            {/* Bulk Faculty */}
            <button
              onClick={() => navigate("/superadmin/bulk-upload/faculty")}
              className="bg-purple-50 hover:bg-purple-100 border rounded-2xl p-4 flex gap-3"
            >
              <div className="p-2 bg-purple-600 text-white rounded-xl">
                <Upload size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-purple-800">
                  Bulk Upload – Faculty
                </p>
                <p className="text-[11px] text-purple-600/80">ZIP upload</p>
              </div>
            </button>

            {/* Add Functional Admin */}
            <button
              onClick={() => navigate("/superadmin/register-functional-admin")}
              className="bg-indigo-50 hover:bg-indigo-100 border rounded-2xl p-4 flex gap-3"
            >
              <div className="p-2 bg-indigo-600 text-white rounded-xl">
                <UserCog size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-indigo-800">
                  Add Functional Admin
                </p>
                <p className="text-[11px] text-indigo-600/80">
                  Create category admin
                </p>
              </div>
            </button>

            {/* Add Department Admin */}
            <button
              onClick={() => navigate("/superadmin/register-department-admin")}
              className="bg-teal-50 hover:bg-teal-100 border rounded-2xl p-4 flex gap-3"
            >
              <div className="p-2 bg-teal-600 text-white rounded-xl">
                <Shield size={18} />
              </div>
              <div>
                <p className="text-xs font-semibold text-teal-800">
                  Add Department Admin
                </p>
                <p className="text-[11px] text-teal-600/80">
                  One per department
                </p>
              </div>
            </button>
          </div>
        </section>

        <section className="bg-white rounded-2xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-sky-800">Students</h2>

            <div className="flex gap-3">
              <select
                className="border rounded-full px-3 py-1 text-sm"
                value={studentDeptFilter}
                onChange={(e) => setStudentDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>

              <select
                className="border rounded-full px-3 py-1 text-sm"
                value={studentYearFilter}
                onChange={(e) => setStudentYearFilter(e.target.value)}
              >
                <option value="">All Years</option>
                <option value="1">1st Year</option>
                <option value="2">2nd Year</option>
                <option value="3">3rd Year</option>
                <option value="4">4th Year</option>
              </select>

              <input
                value={studentSearch}
                onChange={(e) => setStudentSearch(e.target.value)}
                placeholder="Search..."
                className="border rounded-full px-3 py-1 text-sm"
              />
            </div>
          </div>

          {/* STUDENT TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-sky-50 text-left">
                  <th className="px-3 py-2">#</th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("students", "name")}
                  >
                    Name {sortLabel(studentSort, "name")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("students", "usn")}
                  >
                    USN {sortLabel(studentSort, "usn")}
                  </th>

                  <th className="px-3 py-2">Email</th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("students", "year")}
                  >
                    Year {sortLabel(studentSort, "year")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("students", "department")}
                  >
                    Department {sortLabel(studentSort, "department")}
                  </th>

                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {students.map((s, i) => (
                  <tr key={s._id || i} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{s.name}</td>
                    <td className="px-3 py-2">{s.usn}</td>
                    <td className="px-3 py-2">{s.email}</td>
                    <td className="px-3 py-2">{s.year}</td>
                    <td className="px-3 py-2">{s.department}</td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEditUser(s._id)}
                        className="mr-2 text-sky-700 bg-sky-50 hover:bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(s._id)}
                        className="text-rose-700 bg-rose-50 hover:bg-rose-100 w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {students.length === 0 && (
                  <tr>
                    <td colSpan={7} className="text-center py-3 text-gray-500">
                      No students found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ----------------------------- */}
        {/* -------- FACULTY ------------ */}
        {/* ----------------------------- */}

        <section className="bg-white rounded-2xl p-4 border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-emerald-800">Faculty</h2>

            <div className="flex gap-3">
              <select
                className="border rounded-full px-3 py-1 text-sm"
                value={facultyDeptFilter}
                onChange={(e) => setFacultyDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>

              <input
                value={facultySearch}
                onChange={(e) => setFacultySearch(e.target.value)}
                placeholder="Search..."
                className="border rounded-full px-3 py-1 text-sm"
              />
            </div>
          </div>

          {/* FACULTY TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-emerald-50 text-left">
                  <th className="px-3 py-2">#</th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("faculty", "name")}
                  >
                    Name {sortLabel(facultySort, "name")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("faculty", "usn")}
                  >
                    Faculty ID {sortLabel(facultySort, "usn")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("faculty", "email")}
                  >
                    Email {sortLabel(facultySort, "email")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("faculty", "department")}
                  >
                    Department {sortLabel(facultySort, "department")}
                  </th>

                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {faculty.map((f, i) => (
                  <tr key={f._id || i} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{f.name}</td>
                    <td className="px-3 py-2">{f.usn}</td>
                    <td className="px-3 py-2">{f.email}</td>
                    <td className="px-3 py-2">{f.department}</td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEditUser(f._id)}
                        className="mr-2 text-sky-700 bg-sky-50 hover:bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(f._id)}
                        className="text-rose-700 bg-rose-50 hover:bg-rose-100 w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {faculty.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-3 text-gray-500">
                      No faculty found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* ----------------------------- */}
        {/* -------- ADMINS ------------- */}
        {/* ----------------------------- */}

        <section className="bg-white rounded-2xl p-4 border shadow-sm mb-12">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold text-purple-800">Admins</h2>

            <div className="flex gap-3">
              <select
                className="border rounded-full px-3 py-1 text-sm"
                value={adminDeptFilter}
                onChange={(e) => setAdminDeptFilter(e.target.value)}
              >
                <option value="">All Departments</option>
                <option value="CSE">CSE</option>
                <option value="AIML">AIML</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
              </select>

              <select
                className="border rounded-full px-3 py-1 text-sm"
                value={adminRoleFilter}
                onChange={(e) => setAdminRoleFilter(e.target.value)}
              >
                <option value="">All Roles</option>
                <option value="superadmin">Super Admin</option>
                <option value="admin">Admin</option>
                <option value="functional_admin">Functional Admin</option>
                <option value="department_admin">Department Admin</option>
              </select>

              <input
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                placeholder="Search..."
                className="border rounded-full px-3 py-1 text-sm"
              />
            </div>
          </div>

          {/* ADMIN TABLE */}
          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="bg-purple-50 text-left">
                  <th className="px-3 py-2">#</th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("admins", "name")}
                  >
                    Name {sortLabel(adminSort, "name")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("admins", "email")}
                  >
                    Email {sortLabel(adminSort, "email")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("admins", "role")}
                  >
                    Role {sortLabel(adminSort, "role")}
                  </th>

                  <th
                    className="px-3 py-2 cursor-pointer"
                    onClick={() => handleSort("admins", "department")}
                  >
                    Department {sortLabel(adminSort, "department")}
                  </th>

                  <th className="px-3 py-2 text-center">Actions</th>
                </tr>
              </thead>

              <tbody>
                {admins.map((a, i) => (
                  <tr key={a._id || i} className="border-t">
                    <td className="px-3 py-2">{i + 1}</td>
                    <td className="px-3 py-2">{a.name}</td>
                    <td className="px-3 py-2">{a.email}</td>
                    <td className="px-3 py-2">{a.role}</td>
                    <td className="px-3 py-2">{a.department || "-"}</td>

                    <td className="px-3 py-2 text-center">
                      <button
                        onClick={() => handleEditUser(a._id)}
                        className="mr-2 text-sky-700 bg-sky-50 hover:bg-sky-100 w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Edit3 size={14} />
                      </button>

                      <button
                        onClick={() => handleDeleteUser(a._id)}
                        className="text-rose-700 bg-rose-50 hover:bg-rose-100 w-8 h-8 rounded-full flex items-center justify-center"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}

                {admins.length === 0 && (
                  <tr>
                    <td colSpan={6} className="text-center py-3 text-gray-500">
                      No admins found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </main>
    </div>
  );
}
