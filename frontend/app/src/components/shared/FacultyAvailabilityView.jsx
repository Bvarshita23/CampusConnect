import React, { useEffect, useState } from "react";
import { io } from "socket.io-client";
import api from "../../utils/api";

export default function FacultyAvailabilityView({ title }) {
  const [statuses, setStatuses] = useState([]);
  const [search, setSearch] = useState("");

  const fetchStatuses = async () => {
    try {
      const res = await api.get("/faculty/status/all");
      setStatuses(res.statuses || []);
    } catch (e) {
      console.error("Error fetching statuses:", e);
    }
  };

  useEffect(() => {
    fetchStatuses();

    const socket = io("http://localhost:8080");
    socket.emit("join-faculty-status");

    socket.on("faculty-status-updated", fetchStatuses);

    return () => socket.disconnect();
  }, []);

  // 🔍 SEARCH FILTER
  const filtered = statuses.filter((item) => {
    if (!item.faculty) return false;
    const name = item.faculty.name.toLowerCase();
    const dept = item.faculty.department.toLowerCase();
    const q = search.toLowerCase();
    return name.includes(q) || dept.includes(q);
  });

  return (
    <div className="space-y-8">
      {/* ---------------------- PAGE HEADER ---------------------- */}
      <div className="bg-blue-600 p-6 rounded-2xl text-white shadow">
        <h1 className="text-3xl font-bold">{title}</h1>
      </div>

      {/* ---------------------- SEARCH BAR ---------------------- */}
      <div className="flex justify-end">
        <input
          type="text"
          placeholder="Search faculty..."
          className="px-4 py-2 border rounded-xl shadow-sm w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* ---------------------- CARD VIEW ---------------------- */}
      <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filtered.map((item) => {
          const f = item.faculty;
          if (!f) return null;

          return (
            <div
              key={f._id}
              className="p-6 bg-white rounded-xl shadow text-center border border-gray-100"
            >
              {/* Initial Avatar */}
              <div
                className="w-20 h-20 mx-auto rounded-full bg-indigo-100 
                           text-indigo-700 flex items-center justify-center
                           text-3xl font-bold"
              >
                {f.name.charAt(0).toUpperCase()}
              </div>

              <h3 className="mt-3 text-xl font-semibold">{f.name}</h3>
              <p className="text-gray-500">{f.department}</p>

              <div
                className={`mt-3 mx-auto text-center px-4 py-1 rounded-full text-white font-semibold ${
                  item.status === "Available" ? "bg-green-500" : "bg-red-500"
                }`}
              >
                {item.status}
              </div>
            </div>
          );
        })}
      </div>

      {/* ---------------------- TABLE VIEW ---------------------- */}
      <div className="bg-white p-6 rounded-2xl shadow">
        <h2 className="text-xl font-semibold mb-4">Faculty List</h2>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-100 border-b">
                <th className="p-3 font-semibold">Name</th>
                <th className="p-3 font-semibold">Department</th>
                <th className="p-3 font-semibold">Status</th>
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td
                    colSpan="3"
                    className="text-center p-4 text-gray-500 italic"
                  >
                    No faculty found for "{search}"
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const f = item.faculty;
                  if (!f) return null;

                  return (
                    <tr
                      key={f._id}
                      className="border-b hover:bg-gray-50 transition"
                    >
                      <td className="p-3">{f.name}</td>
                      <td className="p-3">{f.department}</td>
                      <td className="p-3">
                        <span
                          className={`px-3 py-1 rounded-full text-white text-sm ${
                            item.status === "Available"
                              ? "bg-green-500"
                              : "bg-red-500"
                          }`}
                        >
                          {item.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
