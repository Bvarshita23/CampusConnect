import React, { useEffect, useState } from "react";
import DashboardLayout from "../../components/DashboardLayout";
import { authFetch } from "../../utils/api";
import { CheckCircle, XCircle, MapPin, Clock } from "lucide-react";

export default function FacultyAvailabilityAdmin() {
  const [facultyList, setFacultyList] = useState([]);
  const [filterDept, setFilterDept] = useState("All");

  useEffect(() => {
    loadStatuses();
  }, []);

  const loadStatuses = async () => {
    try {
      const res = await authFetch("/faculty/status/all");
      if (res.success) {
        setFacultyList(res.statuses);
      }
    } catch (err) {
      console.error("Failed to load", err);
    }
  };

  const departments = [
    "All",
    ...new Set(facultyList.map((f) => f.faculty?.department).filter(Boolean)),
  ];

  const filteredList =
    filterDept === "All"
      ? facultyList
      : facultyList.filter((f) => f.faculty?.department === filterDept);

  return (
    <DashboardLayout title="Faculty Availability">
      {/* Department Filter */}
      <div className="flex items-center gap-3 mb-6">
        <label className="font-medium">Filter by Department:</label>
        <select
          className="border px-3 py-2 rounded"
          value={filterDept}
          onChange={(e) => setFilterDept(e.target.value)}
        >
          {departments.map((d, i) => (
            <option key={i}>{d}</option>
          ))}
        </select>
      </div>

      {/* Faculty List */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredList.map((item, index) => (
          <div
            key={index}
            className="bg-white p-5 rounded-xl shadow border hover:shadow-lg transition"
          >
            {/* Profile */}
            <div className="flex items-center gap-4">
              <img
                src={
                  item.faculty?.photo
                    ? `http://localhost:8080${item.faculty.photo}`
                    : "/default-user.png"
                }
                onError={(e) => (e.target.src = "/default-user.png")}
                className="w-16 h-16 rounded-full object-cover border"
                alt="faculty"
              />

              <div>
                <h3 className="text-lg font-semibold">
                  {item.faculty?.name || "Unnamed"}
                </h3>
                <p className="text-gray-600 text-sm">
                  {item.faculty?.department || "Department Not Set"}
                </p>
                <p className="text-gray-500 text-xs">{item.faculty?.email}</p>
              </div>
            </div>

            {/* Status */}
            <div className="mt-4 flex items-center gap-2">
              {item.status === "available" ? (
                <CheckCircle className="text-green-600" size={20} />
              ) : (
                <XCircle className="text-red-600" size={20} />
              )}

              <span
                className={`font-medium ${
                  item.status === "available"
                    ? "text-green-700"
                    : "text-red-700"
                }`}
              >
                {item.status === "available" ? "Available" : "Not Available"}
              </span>
            </div>

            {/* Message */}
            {item.message && (
              <p className="mt-2 text-gray-700 text-sm italic">
                “{item.message}”
              </p>
            )}

            {/* Location */}
            {item.location && (
              <p className="mt-1 text-sm flex items-center gap-2 text-gray-600">
                <MapPin size={15} />
                {item.location}
              </p>
            )}

            {/* Updated At */}
            <p className="mt-2 text-xs text-gray-500 flex items-center gap-1">
              <Clock size={14} /> Updated:{" "}
              {new Date(item.updatedAt).toLocaleString()}
            </p>
          </div>
        ))}
      </div>
    </DashboardLayout>
  );
}
