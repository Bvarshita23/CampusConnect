import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const ROLE_LABELS = {
  superadmin: "Super Admin",
  admin: "Admin",
  department_admin: "Department Admin",
  functional_admin: "Functional Admin",
};

const ROLE_COLORS = {
  superadmin: "bg-purple-100 text-purple-700",
  admin: "bg-blue-100 text-blue-700",
  department_admin: "bg-green-100 text-green-700",
  functional_admin: "bg-orange-100 text-orange-700",
};

export default function SuperAdminManageAdmins() {
  const [admins, setAdmins] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  const adminRoles = useMemo(
    () => ["superadmin", "admin", "department_admin", "functional_admin"],
    []
  );

  useEffect(() => {
    const fetchAdmins = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/v1/auth/all-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const responseData = res.data;
        let allUsers = [];

        if (Array.isArray(responseData)) {
          allUsers = responseData;
        } else if (Array.isArray(responseData.users)) {
          allUsers = responseData.users;
        } else if (Array.isArray(responseData.data)) {
          allUsers = responseData.data;
        } else {
          console.error("Unexpected API response:", responseData);
          setError("Unexpected API response. Please contact backend dev.");
          setLoading(false);
          return;
        }

        const onlyAdmins = allUsers.filter((u) => adminRoles.includes(u.role));

        setAdmins(onlyAdmins);
        setFiltered(onlyAdmins);
      } catch (err) {
        console.error(err);
        setError("Failed to load admins. Please check API / permissions.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchAdmins();
    } else {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
    }
  }, [token, adminRoles]);

  // 🔍 Apply search + role filter
  useEffect(() => {
    const q = search.toLowerCase();
    let list = admins;

    if (roleFilter !== "all") {
      list = list.filter((a) => a.role === roleFilter);
    }

    list = list.filter((a) => {
      return (
        a.name?.toLowerCase().includes(q) ||
        a.email?.toLowerCase().includes(q) ||
        a.department?.toLowerCase().includes(q)
      );
    });

    setFiltered(list);
  }, [search, roleFilter, admins]);

  // Summary counts
  const summary = useMemo(() => {
    const counts = {
      superadmin: 0,
      admin: 0,
      department_admin: 0,
      functional_admin: 0,
    };
    admins.forEach((a) => {
      if (counts[a.role] !== undefined) counts[a.role] += 1;
    });
    return counts;
  }, [admins]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            Manage Admin Accounts
          </h1>
          <p className="text-gray-700 mt-1 text-sm">
            Logged in as{" "}
            <span className="font-semibold">
              {user?.name} ({ROLE_LABELS[user?.role] || user?.role})
            </span>
          </p>
        </div>

        {/* Search + Role Filter */}
        <div className="flex gap-2 flex-col sm:flex-row sm:items-center">
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm bg-white"
          >
            <option value="all">All roles</option>
            <option value="superadmin">Super Admins</option>
            <option value="admin">Admins</option>
            <option value="department_admin">Department Admins</option>
            <option value="functional_admin">Functional Admins</option>
          </select>

          <input
            type="text"
            placeholder="Search by name, email, department..."
            className="border border-gray-300 rounded-lg px-3 py-2 text-sm w-full sm:w-72"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow text-sm">
          <p className="text-gray-500">Super Admins</p>
          <p className="text-2xl font-bold text-purple-700">
            {summary.superadmin}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-sm">
          <p className="text-gray-500">Admins</p>
          <p className="text-2xl font-bold text-blue-700">{summary.admin}</p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-sm">
          <p className="text-gray-500">Dept Admins</p>
          <p className="text-2xl font-bold text-green-700">
            {summary.department_admin}
          </p>
        </div>
        <div className="bg-white p-4 rounded-xl shadow text-sm">
          <p className="text-gray-500">Functional Admins</p>
          <p className="text-2xl font-bold text-orange-700">
            {summary.functional_admin}
          </p>
        </div>
      </div>

      {/* ERROR / LOADING */}
      {loading && <p>Loading admins...</p>}
      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {/* TABLE */}
      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-600">
          No admins found for the selected filters.
        </p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="bg-white rounded-xl shadow overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-100 text-gray-700">
              <tr>
                <th className="px-4 py-3 text-left">#</th>
                <th className="px-4 py-3 text-left">Name</th>
                <th className="px-4 py-3 text-left">Email</th>
                <th className="px-4 py-3 text-left">Role</th>
                <th className="px-4 py-3 text-left">Department / Category</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((a, index) => (
                <tr
                  key={a._id || index}
                  className={index % 2 === 0 ? "bg-white" : "bg-gray-50"}
                >
                  <td className="px-4 py-2">{index + 1}</td>
                  <td className="px-4 py-2 font-medium">{a.name}</td>
                  <td className="px-4 py-2">{a.email}</td>
                  <td className="px-4 py-2">
                    <span
                      className={
                        "text-xs px-2 py-1 rounded-full font-medium " +
                        (ROLE_COLORS[a.role] || "bg-gray-100 text-gray-700")
                      }
                    >
                      {ROLE_LABELS[a.role] || a.role}
                    </span>
                  </td>
                  <td className="px-4 py-2">{a.department || "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
