import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Upload,
  Users,
  UserCog,
  UserPlus,
  ShieldCheck,
  Layers,
  BarChart3,
} from "lucide-react";

export default function SuperAdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-blue-700">
          Super Admin Dashboard
        </h1>
        <p className="text-gray-700 mt-1">
          Welcome <span className="font-semibold">{user?.name}</span>!
        </p>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Students Count */}
        <div className="bg-white p-5 rounded-xl shadow flex items-center space-x-4">
          <div className="bg-blue-100 p-3 rounded-full text-blue-600">
            <Users size={28} />
          </div>
          <div>
            <p className="text-xl font-bold">—</p>
            <p className="text-gray-500 text-sm">Total Students</p>
          </div>
        </div>

        {/* Faculty Count */}
        <div className="bg-white p-5 rounded-xl shadow flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <UserCog size={28} />
          </div>
          <div>
            <p className="text-xl font-bold">—</p>
            <p className="text-gray-500 text-sm">Total Faculty</p>
          </div>
        </div>

        {/* Admin Count */}
        <div className="bg-white p-5 rounded-xl shadow flex items-center space-x-4">
          <div className="bg-purple-100 p-3 rounded-full text-purple-600">
            <ShieldCheck size={28} />
          </div>
          <div>
            <p className="text-xl font-bold">—</p>
            <p className="text-gray-500 text-sm">Total Admins</p>
          </div>
        </div>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Bulk Upload Students */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/bulk-upload/students")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <Upload size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bulk Upload Students</h2>
              <p className="text-gray-500 text-sm">
                Add/update students for all departments
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Upload Faculty */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/bulk-upload/faculty")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <UserPlus size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bulk Upload Faculty</h2>
              <p className="text-gray-500 text-sm">
                Upload faculty details via Excel
              </p>
            </div>
          </div>
        </div>

        {/* Bulk Upload Admins */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/bulk-upload/admins")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-purple-100 p-3 rounded-full text-purple-600">
              <UserCog size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Bulk Upload Admins</h2>
              <p className="text-gray-500 text-sm">
                Add department & functional admins
              </p>
            </div>
          </div>
        </div>

        {/* Manage Admins */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/superadmin/manage-admins")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
              <Layers size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Manage Admin Accounts</h2>
              <p className="text-gray-500 text-sm">
                View, add, edit admin roles
              </p>
            </div>
          </div>
        </div>

        {/* Functional Admins */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/superadmin/functional-admins")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-orange-100 p-3 rounded-full text-orange-600">
              <ShieldCheck size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Functional Admins</h2>
              <p className="text-gray-500 text-sm">
                Water, Electricity, Internet admins
              </p>
            </div>
          </div>
        </div>

        {/* System Insights (future use) */}
        <div className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition">
          <div className="flex items-center space-x-4">
            <div className="bg-indigo-100 p-3 rounded-full text-indigo-600">
              <BarChart3 size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">System Insights</h2>
              <p className="text-gray-500 text-sm">Analytics coming soon</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
