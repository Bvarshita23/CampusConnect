import React, { useEffect, useState } from "react";
import axios from "axios";

export default function DepartmentAdminStudents() {
  const [students, setStudents] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/v1/auth/all-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Backend returns ALL users → filter here for:
        // 1) role = student
        // 2) same department as department_admin
        // Handle all possible formats safely
        const responseData = res.data;

        let allUsers = [];

        if (Array.isArray(responseData)) {
          allUsers = responseData;
        } else if (Array.isArray(responseData.users)) {
          allUsers = responseData.users;
        } else if (Array.isArray(responseData.data)) {
          allUsers = responseData.data;
        } else {
          console.error("❌ Unexpected API response format:", responseData);
          setError("Unexpected API response. Contact backend developer.");
          return;
        }

        const deptStudents = allUsers.filter((u) => {
          const sameDept = user?.department
            ? u.department === user.department
            : true;
          return u.role === "student" && sameDept;
        });

        setStudents(deptStudents);
        setFiltered(deptStudents);
      } catch (err) {
        console.error(err);
        setError("Failed to load students. Please check API / permissions.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStudents();
    } else {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
    }
  }, [token, user?.department]);

  // 🔍 Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    const f = students.filter((s) => {
      return (
        s.name?.toLowerCase().includes(q) ||
        s.email?.toLowerCase().includes(q) ||
        s.usn?.toLowerCase().includes(q)
      );
    });
    setFiltered(f);
  }, [search, students]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            Department Students
          </h1>
          <p className="text-gray-700 mt-1">
            Department:{" "}
            <span className="font-semibold uppercase">
              {user?.department || "N/A"}
            </span>
          </p>
        </div>

        {/* Search */}
        <div className="w-full sm:w-64">
          <input
            type="text"
            placeholder="Search by name, USN, email..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading students...</p>}
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-600">No students found for this department.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">USN</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Year</th>
                <th className="px-4 py-3 text-left">Department</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((s, index) => (
                <tr
                  key={s._id || index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2">{s.usn || "-"}</td>
                  <td className="px-4 py-2">{s.email}</td>
                  <td className="px-4 py-2">{s.year || "-"}</td>
                  <td className="px-4 py-2">{s.department || "-"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
