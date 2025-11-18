// frontend/app/src/components/Navbar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const user = JSON.parse(localStorage.getItem("user"));

  const handleDashboardClick = () => {
    if (!user) {
      navigate("/login");
    } else if (user.role === "student") {
      navigate("/student/dashboard");
    } else if (user.role === "faculty") {
      navigate("/faculty/dashboard");
    } else if (user.role === "admin") {
      navigate("/admin/dashboard");
    } else if (user.role === "superadmin") {
      navigate("/superadmin/dashboard");
    } else if (user.role === "department_admin") {
      navigate("/department-admin/dashboard");
    }
  };

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <header className="w-full bg-white border-b border-slate-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        {/* Left: Brand */}
        <div
          onClick={handleDashboardClick}
          className="flex items-center gap-3 cursor-pointer"
        >
          <div className="h-9 w-9 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            CC
          </div>
          <div className="flex flex-col">
            <span className="text-base font-semibold text-slate-900">
              CampusConnect
            </span>
            <span className="text-xs text-slate-500">
              {user?.role ? user.role.toUpperCase() : "PORTAL"}
            </span>
          </div>
        </div>

        {/* Middle Placeholder */}
        <div className="hidden sm:flex flex-1 justify-center"></div>

        {/* Right: Only Logout */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-red-500 text-white hover:bg-red-600 transition shadow-sm"
          >
            <LogOut size={16} />
            <span>Logout</span>
          </button>
        </div>
      </div>
    </header>
  );
}
