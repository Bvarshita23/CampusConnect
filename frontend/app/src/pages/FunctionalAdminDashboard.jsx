import React from "react";
import { useNavigate } from "react-router-dom";
import {
  Wrench,
  ClipboardList,
  CheckCircle2,
  Clock4,
  History,
} from "lucide-react";

export default function FunctionalAdminDashboard() {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* HEADER */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-orange-600">
          Functional Admin Dashboard
        </h1>
        <p className="text-gray-700 mt-1">
          Welcome <span className="font-semibold">{user?.name}</span>! <br />
          Category:{" "}
          <span className="font-semibold uppercase">
            {user?.department || "N/A"}
          </span>
        </p>
      </div>

      {/* QUICK STATS */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {/* Pending */}
        <div className="bg-white p-5 rounded-xl shadow flex items-center space-x-4">
          <div className="bg-red-100 p-3 rounded-full text-red-600">
            <ClipboardList size={28} />
          </div>
          <div>
            <p className="text-xl font-bold">—</p>
            <p className="text-gray-500 text-sm">Pending Complaints</p>
          </div>
        </div>

        {/* In Progress */}
        <div className="bg-white p-5 rounded-xl shadow flex items-center space-x-4">
          <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
            <Clock4 size={28} />
          </div>
          <div>
            <p className="text-xl font-bold">—</p>
            <p className="text-gray-500 text-sm">In Progress</p>
          </div>
        </div>

        {/* Resolved */}
        <div className="bg-white p-5 rounded-xl shadow flex items-center space-x-4">
          <div className="bg-green-100 p-3 rounded-full text-green-600">
            <CheckCircle2 size={28} />
          </div>
          <div>
            <p className="text-xl font-bold">—</p>
            <p className="text-gray-500 text-sm">Resolved</p>
          </div>
        </div>
      </div>

      {/* ACTION CARDS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Pending Complaints */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/functional-admin/pending")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-red-100 p-3 rounded-full text-red-600">
              <Wrench size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Pending Complaints</h2>
              <p className="text-gray-500 text-sm">Review and take action</p>
            </div>
          </div>
        </div>

        {/* In Progress Complaints */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/functional-admin/in-progress")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-yellow-100 p-3 rounded-full text-yellow-600">
              <Clock4 size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">In Progress</h2>
              <p className="text-gray-500 text-sm">
                Complaints being worked on
              </p>
            </div>
          </div>
        </div>

        {/* Resolved Complaints */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/functional-admin/resolved")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-green-100 p-3 rounded-full text-green-600">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">Resolved Complaints</h2>
              <p className="text-gray-500 text-sm">View closed complaints</p>
            </div>
          </div>
        </div>

        {/* All Complaints */}
        <div
          className="p-6 bg-white rounded-xl shadow hover:shadow-lg cursor-pointer transition"
          onClick={() => navigate("/functional-admin/all")}
        >
          <div className="flex items-center space-x-4">
            <div className="bg-blue-100 p-3 rounded-full text-blue-600">
              <History size={30} />
            </div>
            <div>
              <h2 className="text-lg font-bold">All Complaints</h2>
              <p className="text-gray-500 text-sm">Full complaint history</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
