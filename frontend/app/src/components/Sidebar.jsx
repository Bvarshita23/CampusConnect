import React from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  PackagePlus,
  Clock,
  AlertTriangle,
  Users,
  History,
  LogOut,
  Upload,
} from "lucide-react";

export default function Sidebar({ onLogout }) {
  const navigate = useNavigate();
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
    if (onLogout) onLogout();
    navigate("/login");
  };

  return (
    <div className="w-64 bg-white shadow-md h-screen p-6 flex flex-col justify-between">
      <div>
        <h2 className="text-2xl font-bold mb-8 text-blue-600">CampusConnect</h2>
        <ul className="space-y-4 text-gray-700">
          <li
            onClick={handleDashboardClick}
            className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
          >
            <LayoutDashboard size={20} />
            <span>Dashboard</span>
          </li>

          {/* ===============================
              STUDENT LINKS
          ================================= */}
          {user?.role === "student" && (
            <>
              <li
                onClick={() => navigate("/student/found-items")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <PackageSearch size={20} />
                <span>Found Items</span>
              </li>

              <li
                onClick={() => navigate("/student/lostfound")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <PackagePlus size={20} />
                <span>Lost Items</span>
              </li>

              <li
                onClick={() => navigate("/student/queue")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Clock size={20} />
                <span>Queue Management</span>
              </li>

              <li
                onClick={() => navigate("/student/report-problem")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <AlertTriangle size={20} />
                <span>Problem Reporting</span>
              </li>

              <li
                onClick={() => navigate("/student/availability")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Users size={20} />
                <span>Faculty Availability</span>
              </li>

              <li
                onClick={() => navigate("/student/history")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <History size={20} />
                <span>History</span>
              </li>
            </>
          )}

          {/* ===============================
              FACULTY LINKS
          ================================= */}
          {user?.role === "faculty" && (
            <>
              <li
                onClick={() => navigate("/faculty/dashboard")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <LayoutDashboard size={20} />
                <span>Faculty Dashboard</span>
              </li>

              <li
                onClick={() => navigate("/faculty/availability")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Users size={20} />
                <span>Manage Availability</span>
              </li>

              <li
                onClick={() => navigate("/faculty/queue")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Clock size={20} />
                <span>Queue Management</span>
              </li>

              <li
                onClick={() => navigate("/faculty/problems")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <AlertTriangle size={20} />
                <span>Problem Reports</span>
              </li>
            </>
          )}

          {/* ===============================
              NORMAL ADMIN LINKS
          ================================= */}
          {user?.role === "admin" && (
            <>
              <li
                onClick={() => navigate("/admin/dashboard")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <LayoutDashboard size={20} />
                <span>Admin Dashboard</span>
              </li>

              <li
                onClick={() => navigate("/admin/problems")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <AlertTriangle size={20} />
                <span>Manage Problems</span>
              </li>

              <li
                onClick={() => navigate("/admin/found-items")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <PackageSearch size={20} />
                <span>Found Items</span>
              </li>

              <li
                onClick={() => navigate("/admin/lostfound")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <PackagePlus size={20} />
                <span>Lost Items</span>
              </li>
            </>
          )}

          {/* ===============================
              DEPARTMENT ADMIN LINKS
          ================================= */}
          {user?.role === "department_admin" && (
            <>
              <li
                onClick={() => navigate("/department-admin/dashboard")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <LayoutDashboard size={20} />
                <span>Department Admin Dashboard</span>
              </li>

              <li
                onClick={() => navigate("/bulk-upload/students")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Upload size={20} />
                <span>Bulk Upload Students</span>
              </li>

              <li
                onClick={() => navigate("/bulk-upload/faculty")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Upload size={20} />
                <span>Bulk Upload Faculty</span>
              </li>

              {/* 👇 NEW */}
              <li
                onClick={() => navigate("/department-admin/students")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Users size={20} />
                <span>Students List</span>
              </li>
              <li
                onClick={() => navigate("/department-admin/faculty")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Users size={20} />
                <span>Faculty List</span>
              </li>
            </>
          )}

          {/* ===============================
              SUPERADMIN LINKS
          ================================= */}
          {user?.role === "superadmin" && (
            <>
              <li
                onClick={() => navigate("/superadmin/dashboard")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <LayoutDashboard size={20} />
                <span>Super Admin Dashboard</span>
              </li>

              <li
                onClick={() => navigate("/bulk-upload/students")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Upload size={20} />
                <span>Bulk Upload Students</span>
              </li>

              <li
                onClick={() => navigate("/bulk-upload/faculty")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Upload size={20} />
                <span>Bulk Upload Faculty</span>
              </li>

              <li
                onClick={() => navigate("/bulk-upload/admins")}
                className="flex items-center space-x-3 hover:text-blue-600 cursor-pointer"
              >
                <Upload size={20} />
                <span>Bulk Upload Admins</span>
              </li>
            </>
          )}
        </ul>
      </div>

      {/* 🚪 LOGOUT BUTTON */}
      <button
        onClick={handleLogout}
        className="flex items-center justify-center space-x-2 bg-red-500 text-white py-2 rounded-md hover:bg-red-600"
      >
        <LogOut size={18} />
        <span>Logout</span>
      </button>
    </div>
  );
}
