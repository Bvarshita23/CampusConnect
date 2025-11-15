import React, { useEffect, useState } from "react";
import axios from "axios";

const FacultyAvatar = ({ name = "", photo }) => {
  const initial = name ? name.charAt(0).toUpperCase() : "?";

  if (photo) {
    return (
      <img
        src={photo}
        alt={name}
        className="w-12 h-12 rounded-full object-cover border"
      />
    );
  }

  return (
    <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border">
      {initial}
    </div>
  );
};

export default function DepartmentAdminFaculty() {
  const [faculty, setFaculty] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const user = JSON.parse(localStorage.getItem("user"));
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFaculty = async () => {
      try {
        setLoading(true);
        setError("");

        const res = await axios.get("/api/v1/auth/all-users", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        // Handle different response formats safely
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

        const deptFaculty = allUsers.filter((u) => {
          const sameDept = user?.department
            ? u.department === user.department
            : true;
          return u.role === "faculty" && sameDept;
        });

        setFaculty(deptFaculty);
        setFiltered(deptFaculty);
      } catch (err) {
        console.error(err);
        setError("Failed to load faculty. Please check API / permissions.");
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchFaculty();
    } else {
      setError("Not authenticated. Please log in again.");
      setLoading(false);
    }
  }, [token, user?.department]);

  // 🔍 Search filter
  useEffect(() => {
    const q = search.toLowerCase();
    const f = faculty.filter((f) => {
      return (
        f.name?.toLowerCase().includes(q) ||
        f.email?.toLowerCase().includes(q) ||
        f.usn?.toLowerCase().includes(q)
      );
    });
    setFiltered(f);
  }, [search, faculty]);

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold text-blue-700">
            Department Faculty
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
            placeholder="Search by name, ID, email..."
            className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      {/* CONTENT */}
      {loading && <p>Loading faculty...</p>}

      {error && <p className="text-red-600 mb-4 text-sm">{error}</p>}

      {!loading && !error && filtered.length === 0 && (
        <p className="text-gray-600">No faculty found for this department.</p>
      )}

      {!loading && !error && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((f) => (
            <div
              key={f._id}
              className="bg-white rounded-xl shadow p-4 flex items-start space-x-4"
            >
              <FacultyAvatar name={f.name} photo={f.photo} />

              <div className="flex-1">
                {/* Name + Role badge */}
                <div className="flex items-center justify-between">
                  <h2 className="font-semibold text-gray-800">
                    {f.name || "Unnamed Faculty"}
                  </h2>
                  <span className="text-xs px-2 py-1 rounded-full bg-blue-100 text-blue-700 font-medium">
                    Faculty
                  </span>
                </div>

                {/* Faculty ID / USN */}
                <p className="text-sm text-gray-600 mt-1">
                  <span className="font-semibold">Faculty ID:</span>{" "}
                  {f.usn || "—"}
                </p>

                {/* Email */}
                <p className="text-sm text-gray-600">
                  <span className="font-semibold">Email:</span> {f.email || "—"}
                </p>

                {/* Department + (placeholder) availability */}
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs px-2 py-1 rounded-full bg-gray-100 text-gray-700">
                    {f.department || "Department N/A"}
                  </span>

                  <span className="text-xs px-2 py-1 rounded-full bg-green-100 text-green-700">
                    Availability: N/A
                  </span>
                  {/* Later you can connect this to real availability API */}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
