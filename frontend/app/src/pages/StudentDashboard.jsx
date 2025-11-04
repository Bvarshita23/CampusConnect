import React, { useState } from "react";
import {
  LayoutDashboard,
  PackageSearch,
  Clock,
  Wrench,
  Users,
  LogOut,
  Menu,
  X,
  Plus,
} from "lucide-react";
import { useNavigate } from "react-router-dom";

import LostItems from "./Student/LostItems";
import FoundItems from "./Student/FoundItems";

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("found"); // default
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  const renderContent = () => {
    switch (activeTab) {
      case "found":
        return <FoundItems search={search} />;
      case "lost":
        return <LostItems search={search} />;
      case "dashboard":
        return (
          <div className="p-8 text-gray-700">
            <h2 className="text-3xl font-semibold mb-3">Welcome 👋</h2>
            <p className="text-gray-600">
              Manage all your campus services easily from your personalized
              dashboard.
            </p>
          </div>
        );
      case "queue":
        return (
          <h2 className="text-2xl font-semibold text-gray-700">
            Queue Management — coming soon 🕒
          </h2>
        );
      case "problem":
        return (
          <h2 className="text-2xl font-semibold text-gray-700">
            Problem Reporting — coming soon 🛠️
          </h2>
        );
      case "faculty":
        return (
          <h2 className="text-2xl font-semibold text-gray-700">
            Faculty Availability — coming soon 👩‍🏫
          </h2>
        );
      default:
        return null;
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  const navItems = [
    {
      id: "dashboard",
      label: "Dashboard",
      icon: <LayoutDashboard size={18} />,
    },
    { id: "found", label: "Found Items", icon: <PackageSearch size={18} /> },
    { id: "lost", label: "Lost Items", icon: <PackageSearch size={18} /> },
    { id: "queue", label: "Queue Management", icon: <Clock size={18} /> },
    { id: "problem", label: "Problem Reporting", icon: <Wrench size={18} /> },
    { id: "faculty", label: "Faculty Availability", icon: <Users size={18} /> },
  ];

  const showAddButton = activeTab === "found" || activeTab === "lost";

  return (
    <div className="relative min-h-screen flex flex-col bg-gradient-to-b from-white via-blue-50 to-blue-100 font-[Inter]">
      {/* Top Navbar */}
      <header className="flex items-center justify-between p-4 bg-white shadow-sm border-b sticky top-0 z-40">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(true)}
            className="p-2 rounded-md hover:bg-gray-100 transition"
          >
            <Menu size={22} />
          </button>
          <h1 className="text-2xl font-bold text-[#0A66C2]">CampusConnect</h1>
        </div>
        <p className="text-gray-600 text-sm">Student Dashboard</p>
      </header>

      {/* Sidebar Overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/40 z-40"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-64 bg-white shadow-2xl transform transition-transform duration-300 z-50 flex flex-col justify-between ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full overflow-y-auto">
          <div className="flex items-center justify-between p-5 border-b">
            <h1 className="text-xl font-extrabold text-[#0A66C2]">
              CampusConnect
            </h1>
            <button onClick={() => setSidebarOpen(false)}>
              <X size={20} />
            </button>
          </div>

          <nav className="mt-4 space-y-1 flex-1 px-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                className={`flex items-center w-full text-left px-4 py-3 rounded-lg transition-all duration-200 ${
                  activeTab === item.id
                    ? "bg-[#E8F2FD] text-[#0A66C2] font-semibold shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                }`}
                onClick={() => {
                  setActiveTab(item.id);
                  setSidebarOpen(false);
                }}
              >
                <span className="mr-3">{item.icon}</span>
                {item.label}
              </button>
            ))}
          </nav>
        </div>

        <div className="p-5 border-t">
          <button
            onClick={handleLogout}
            className="flex items-center justify-center gap-2 w-full bg-gradient-to-r from-red-500 to-red-600 text-white font-semibold py-2 rounded-lg shadow-sm hover:shadow-md hover:scale-[1.02] transition"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </aside>

      {/* Main Content + single Add button (no duplicates) */}
      <main className="flex-1 overflow-y-auto p-6 sm:p-10">
        <div className="relative">
          {showAddButton && (
            <button
              onClick={() => navigate("/student/add-found")}
              className="absolute -top-2 right-0 bg-[#0A66C2] text-white flex items-center gap-2 px-4 py-2 rounded-lg font-medium shadow-md hover:shadow-lg hover:scale-[1.03] transition"
            >
              <Plus size={18} /> Add Item
            </button>
          )}
          {renderContent()}
        </div>
      </main>
    </div>
  );
}
