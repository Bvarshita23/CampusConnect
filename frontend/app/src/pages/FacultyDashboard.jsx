import React from "react";
import { LogOut } from "lucide-react";

export default function FacultyDashboard() {
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    window.location.href = "/login";
  };

  return (
    <div className="min-h-screen bg-gray-50 font-[Inter] flex flex-col">
      {/* Header */}
      <header className="bg-white shadow-md px-8 py-4 flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-extrabold text-[#0A66C2]">
            CampusConnect
          </h1>
          <p className="text-sm text-gray-500">Faculty</p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 px-4 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition"
        >
          <LogOut size={16} />
          Logout
        </button>
      </header>

      {/* Content */}
      <main className="flex-1 p-10">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">
          Faculty Dashboard
        </h1>
        <p className="text-gray-600">
          Manage your availability and student interactions here. 🧑‍🏫
        </p>
        <div className="mt-8 text-gray-500 italic">
          Faculty Queue Management Module — coming soon.
        </div>
      </main>
    </div>
  );
}
