import React from "react";
import { useNavigate } from "react-router-dom";
import { Upload, Users, UserPlus, BookOpen, GraduationCap } from "lucide-react";

export default function DepartmentAdminDashboard() {
  const user = JSON.parse(localStorage.getItem("user"));
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">
          Department Admin Dashboard
        </h1>
        <p className="text-gray-700 mt-1">
          Welcome <span className="font-semibold">{user?.name}</span>! <br />
          Department:{" "}
          <span className="font-semibold uppercase">
            {user?.department || "N/A"}
          </span>
        </p>
      </div>

      {/* GRID CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bulk Upload Students */}
        <div
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/bulk-upload/students")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 text-blue-600 p-3 rounded-full">
              <Upload size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Bulk Upload Students</h2>
              <p className="text-sm text-gray-500">
                Upload Excel + Photos for all students
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Upload Faculty */}
        <div
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/bulk-upload/faculty")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 text-green-600 p-3 rounded-full">
              <UserPlus size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Bulk Upload Faculty</h2>
              <p className="text-sm text-gray-500">
                Add or update faculty via Excel
              </p>
            </div>
          </div>
        </div>

        {/* View Student List */}
        <div
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/department-admin/students")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 text-purple-600 p-3 rounded-full">
              <GraduationCap size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Students List</h2>
              <p className="text-sm text-gray-500">
                View all students in your department
              </p>
            </div>
          </div>
        </div>

        {/* View Faculty List */}
        <div
          className="bg-white p-6 rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/department-admin/faculty")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 text-orange-600 p-3 rounded-full">
              <Users size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Faculty List</h2>
              <p className="text-sm text-gray-500">
                View all faculty in your department
              </p>
            </div>
          </div>
        </div>

        {/* Documentation / Help */}
        <div className="bg-white p-6 rounded-xl shadow cursor-pointer shadow hover:shadow-lg transition">
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 text-yellow-600 p-3 rounded-full">
              <BookOpen size={28} />
            </div>
            <div>
              <h2 className="text-lg font-semibold">Help / Documentation</h2>
              <p className="text-sm text-gray-500">
                Learn how to use this portal
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
