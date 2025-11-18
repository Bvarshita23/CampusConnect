import React, { useEffect, useMemo, useState, useRef } from "react";
import { io } from "socket.io-client";
import {
  Users,
  Clock,
  MapPin,
  RefreshCcw,
  Search,
  Award,
  GraduationCap,
  BookOpen,
} from "lucide-react";
import { authFetch } from "../../utils/api";

const STATUS_META = {
  Available: {
    label: "Available",
    badge: "bg-emerald-100 text-emerald-700",
    dot: "bg-emerald-500",
  },
  "In Class": {
    label: "In Class",
    badge: "bg-blue-100 text-blue-700",
    dot: "bg-blue-500",
  },
  Busy: {
    label: "Busy",
    badge: "bg-amber-100 text-amber-700",
    dot: "bg-amber-500",
  },
  "On Leave": {
    label: "On Leave",
    badge: "bg-rose-100 text-rose-700",
    dot: "bg-rose-500",
  },
  Offline: {
    label: "Offline",
    badge: "bg-slate-100 text-slate-600",
    dot: "bg-slate-400",
  },
};

const STATUS_FILTERS = [
  { value: "", label: "All Teachers" },
  { value: "Available", label: "Available Now" },
  { value: "In Class", label: "In Class" },
  { value: "Busy", label: "Busy" },
  { value: "On Leave", label: "On Leave" },
  { value: "Offline", label: "Offline" },
];

const dayOrder = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const sortOfficeHours = (slots = []) =>
  [...slots].sort((a, b) => dayOrder.indexOf(a.day) - dayOrder.indexOf(b.day));

export default function FacultyFinder() {
  const [statuses, setStatuses] = useState([]);
  const [filters, setFilters] = useState({
    department: "",
    status: "",
    search: "",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const socketRef = useRef(null);

  const fetchStatuses = async () => {
    try {
      setLoading(true);
      setError("");
      const params = new URLSearchParams();
      if (filters.department) params.append("department", filters.department);
      if (filters.status) params.append("status", filters.status);
      if (filters.search) params.append("search", filters.search);

      const data = await authFetch(`/faculty/status?${params.toString()}`);
      setStatuses(data.statuses || []);
    } catch (err) {
      console.error("Faculty availability load error", err);
      setError(err.message || "Failed to load faculty statuses");
    } finally {
      setLoading(false);
    }
  };

  // 🔌 Socket.io for real-time updates
  useEffect(() => {
    try {
      socketRef.current = io("http://localhost:8080", {
        transports: ["websocket", "polling"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5,
      });

      socketRef.current.on("connect", () => {
        console.log("✅ Connected to Socket.io server");
        socketRef.current.emit("join-faculty-status");
      });

      socketRef.current.on("faculty-status-updated", (data) => {
        setStatuses((prev) => {
          const updated = [...prev];
          const facultyId =
            data.facultyId || data.status?.faculty?._id?.toString();
          const index = updated.findIndex((s) => {
            const id = s.faculty?._id?.toString() || s.faculty?._id?.toString();
            return id === facultyId;
          });

          if (index !== -1) {
            updated[index] = data.status;
          } else if (data.status) {
            updated.push(data.status);
          }
          return updated;
        });
      });

      socketRef.current.on("disconnect", () => {
        console.log("❌ Disconnected from Socket.io server");
      });
    } catch (err) {
      console.error("Socket init error:", err);
    }

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    fetchStatuses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.department, filters.status]);

  const handleRefresh = () => fetchStatuses();

  const filteredStatuses = useMemo(() => {
    if (!filters.search) return statuses;
    const term = filters.search.trim().toLowerCase();
    return statuses.filter((item) =>
      (item.faculty?.name || "").toLowerCase().includes(term)
    );
  }, [statuses, filters.search]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-blue-600 text-white rounded-3xl shadow-lg p-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold mb-2">Faculty Finder</h1>
            <p className="text-white/90 text-lg">
              Find and connect with faculty members across departments
            </p>
          </div>
          <Users size={48} className="text-white/80" />
        </div>
      </div>

      {/* Status Filters */}
      <div className="flex flex-wrap gap-3 bg-white p-4 rounded-2xl shadow-md border border-blue-100">
        {STATUS_FILTERS.map((filter) => (
          <button
            key={filter.value}
            onClick={() =>
              setFilters((prev) => ({ ...prev, status: filter.value }))
            }
            className={`px-6 py-3 rounded-full font-semibold transition-all flex items-center gap-2 ${
              filters.status === filter.value
                ? "bg-yellow-400 text-gray-900 shadow-lg scale-105"
                : "bg-white text-gray-700 border-2 border-gray-200 hover:border-blue-400 hover:bg-blue-50"
            }`}
          >
            <Users size={18} />
            {filter.label}
          </button>
        ))}
      </div>

      {/* Search + Department */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-white p-5 rounded-2xl shadow border border-blue-100">
        <div className="relative">
          <Search
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            size={18}
          />
          <input
            type="text"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search faculty by name..."
            className="w-full pl-10 pr-4 py-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200"
          />
        </div>
        <div className="relative">
          <select
            value={filters.department}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, department: e.target.value }))
            }
            className="w-full px-4 py-3 border border-blue-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-200 appearance-none bg-white"
          >
            <option value="">All Departments</option>
            {["CSE", "AIML", "ECE", "EEE", "CIVIL", "ME", "ISE"].map((dept) => (
              <option key={dept} value={dept}>
                {dept}
              </option>
            ))}
          </select>
        </div>
        <button
          onClick={handleRefresh}
          className="md:col-span-2 flex items-center justify-center gap-2 text-blue-600 hover:text-blue-700 font-medium"
        >
          <RefreshCcw size={18} /> Refresh
        </button>
      </div>

      {/* Cards */}
      <div className="bg-white rounded-3xl shadow-md border border-blue-100">
        {loading ? (
          <div className="py-16 text-center text-gray-500">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4">Loading faculty availability...</p>
          </div>
        ) : error ? (
          <div className="py-16 text-center text-rose-500">{error}</div>
        ) : filteredStatuses.length === 0 ? (
          <div className="py-16 text-center text-gray-500">
            No faculty records found.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 p-6">
            {filteredStatuses
              .filter((item) => item.faculty && item.faculty._id)
              .map((item) => {
                const meta = STATUS_META[item.status] || STATUS_META["Offline"];
                const hours = sortOfficeHours(item.officeHours || []);
                const facultyId =
                  item.faculty._id?.toString() || item.faculty._id;

                return (
                  <div
                    key={facultyId}
                    className="bg-white rounded-2xl border-2 border-gray-200 shadow-lg hover:shadow-xl transition-all p-6"
                  >
                    {/* Top section */}
                    <div className="flex items-start gap-4 mb-4">
                      <div className="relative">
                        <img
                          src={
                            item.faculty.photo
                              ? `http://localhost:8080${item.faculty.photo}`
                              : "https://i.pravatar.cc/120"
                          }
                          alt={item.faculty.name || "Faculty"}
                          className="w-24 h-24 rounded-full border-4 border-blue-100 object-cover"
                        />
                        <div
                          className={`absolute bottom-0 right-0 w-4 h-4 ${meta.dot} rounded-full border-2 border-white`}
                        />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-800 mb-1">
                          {item.faculty.name || "Unknown Faculty"}
                        </h3>
                        <p className="text-sm text-gray-600 mb-2">
                          {item.faculty.department || "General Department"}
                        </p>
                        <span
                          className={`inline-block px-3 py-1 text-xs font-semibold rounded-full ${meta.badge}`}
                        >
                          {meta.label}
                        </span>
                      </div>
                    </div>

                    {/* Experience / subjects / achievements */}
                    <div className="space-y-3 mb-4">
                      <div className="flex items-start gap-2">
                        <GraduationCap
                          size={18}
                          className="text-blue-600 mt-0.5"
                        />
                        <div>
                          <span className="text-xs text-gray-500">
                            Experience:
                          </span>
                          <p className="text-sm font-medium text-gray-800">
                            {item.faculty.experienceYears > 0
                              ? `${item.faculty.experienceYears} years`
                              : "Not specified"}
                          </p>
                        </div>
                      </div>

                      {item.faculty.subjects && (
                        <div className="flex items-start gap-2">
                          <BookOpen
                            size={18}
                            className="text-blue-600 mt-0.5"
                          />
                          <div>
                            <span className="text-xs text-gray-500">
                              Subjects:
                            </span>
                            <p className="text-sm font-medium text-gray-800">
                              {item.faculty.subjects}
                            </p>
                          </div>
                        </div>
                      )}

                      {item.faculty.achievements && (
                        <div className="flex items-start gap-2">
                          <Award size={18} className="text-blue-600 mt-0.5" />
                          <div>
                            <span className="text-xs text-gray-500">
                              Achievements:
                            </span>
                            <p className="text-sm font-medium text-gray-800">
                              {item.faculty.achievements}
                            </p>
                          </div>
                        </div>
                      )}

                      {item.location && (
                        <div className="flex items-start gap-2">
                          <MapPin size={18} className="text-blue-600 mt-0.5" />
                          <div>
                            <span className="text-xs text-gray-500">
                              Location:
                            </span>
                            <p className="text-sm font-medium text-gray-800">
                              {item.location}
                            </p>
                          </div>
                        </div>
                      )}

                      {item.message && (
                        <div className="bg-slate-50 border border-slate-200 p-3 rounded-xl">
                          <p className="text-sm text-gray-700">
                            {item.message}
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Office hours */}
                    {hours.length > 0 && (
                      <div className="mb-4 border-t border-gray-200 pt-3">
                        <h4 className="text-xs uppercase text-gray-500 tracking-wide mb-2 font-semibold">
                          Office Hours
                        </h4>
                        <ul className="space-y-1 text-sm text-gray-600">
                          {hours.map((slot, idx) => (
                            <li
                              key={idx}
                              className="flex justify-between items-center"
                            >
                              <span className="font-medium">{slot.day}</span>
                              <span className="text-gray-700">
                                {slot.from} - {slot.to}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Dummy actions */}
                    <div className="flex gap-2 mt-4">
                      <button className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-lg hover:bg-gray-200 transition text-sm font-medium flex items-center justify-center gap-2">
                        <Clock size={16} />
                        No Demo Link
                      </button>
                      <button className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg hover:bg-orange-600 transition text-sm font-medium">
                        View Details
                      </button>
                    </div>
                  </div>
                );
              })}
          </div>
        )}
      </div>
    </div>
  );
}
