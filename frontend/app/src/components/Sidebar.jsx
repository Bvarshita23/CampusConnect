// frontend/app/src/components/Sidebar.jsx
import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  PackageSearch,
  PackagePlus,
  Clock,
  AlertTriangle,
  Users,
  History,
  LogOut,
  UserPlus,
  UserCheck,
  Plus,
  FolderPlus,
  Upload,
} from "lucide-react";

export default function Sidebar({ onLogout }) {
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
    if (onLogout) onLogout();
    navigate("/login");
  };

  const isActive = (path) => location.pathname.startsWith(path);

  const baseItemClasses =
    "flex items-center gap-3 px-4 py-2.5 rounded-xl cursor-pointer transition-all text-sm font-medium";
  const activeClasses = "bg-blue-600 text-white shadow-md";
  const inactiveClasses = "text-slate-600 hover:bg-blue-50 hover:text-blue-700";

  return (
    <div className="h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between shadow-sm">
      {/* Top: Logo + Menu */}
      <div>
        {/* Brand */}
        <div className="px-6 pt-6 pb-4 flex items-center gap-3">
          <div className="h-10 w-10 rounded-2xl bg-blue-600 flex items-center justify-center text-white font-bold text-lg">
            CC
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 leading-tight">
              CampusConnect
            </h2>
            <p className="text-xs text-slate-500">
              {user?.role ? user.role.toUpperCase() : "PORTAL"}
            </p>
          </div>
        </div>

        <div className="px-4 mt-4">
          {/* Common: Dashboard */}
          <div
            onClick={handleDashboardClick}
            className={`${baseItemClasses} ${
              isActive("/student/dashboard") ||
              isActive("/faculty/dashboard") ||
              isActive("/admin/dashboard") ||
              isActive("/superadmin/dashboard") ||
              isActive("/department-admin/dashboard")
                ? activeClasses
                : inactiveClasses
            }`}
          >
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </div>

          {/* STUDENT LINKS */}
          {user?.role === "student" && (
            <div className="mt-3 space-y-1.5">
              <div
                onClick={() => navigate("/student/found-items")}
                className={`${baseItemClasses} ${
                  isActive("/student/found-items")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <PackageSearch size={18} />
                <span>Found Items</span>
              </div>
              <div
                onClick={() => navigate("/student/lostfound")}
                className={`${baseItemClasses} ${
                  isActive("/student/lostfound")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <PackagePlus size={18} />
                <span>Lost Items</span>
              </div>
              <div
                onClick={() => navigate("/student/queue")}
                className={`${baseItemClasses} ${
                  isActive("/student/queue") ? activeClasses : inactiveClasses
                }`}
              >
                <Clock size={18} />
                <span>Queue Management</span>
              </div>
              <div
                onClick={() => navigate("/student/report-problem")}
                className={`${baseItemClasses} ${
                  isActive("/student/report-problem")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <AlertTriangle size={18} />
                <span>Problem Reporting</span>
              </div>
              <div
                onClick={() => navigate("/student/availability")}
                className={`${baseItemClasses} ${
                  isActive("/student/availability")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Users size={18} />
                <span>Faculty Availability</span>
              </div>
              <div
                onClick={() => navigate("/student/history")}
                className={`${baseItemClasses} ${
                  isActive("/student/history") ? activeClasses : inactiveClasses
                }`}
              >
                <History size={18} />
                <span>History</span>
              </div>
            </div>
          )}

          {/* FACULTY LINKS */}
          {user?.role === "faculty" && (
            <div className="mt-3 space-y-1.5">
              <div
                onClick={() => navigate("/faculty/dashboard")}
                className={`${baseItemClasses} ${
                  isActive("/faculty/dashboard")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Faculty Dashboard</span>
              </div>
              <div
                onClick={() => navigate("/faculty/availability")}
                className={`${baseItemClasses} ${
                  isActive("/faculty/availability")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Users size={18} />
                <span>Manage Availability</span>
              </div>
              <div
                onClick={() => navigate("/faculty/queue")}
                className={`${baseItemClasses} ${
                  isActive("/faculty/queue") ? activeClasses : inactiveClasses
                }`}
              >
                <Clock size={18} />
                <span>Queue Management</span>
              </div>
              <div
                onClick={() => navigate("/faculty/problems")}
                className={`${baseItemClasses} ${
                  isActive("/faculty/problems")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <AlertTriangle size={18} />
                <span>Problem Reports</span>
              </div>
            </div>
          )}

          {/* ADMIN LINKS */}
          {user?.role === "admin" && (
            <div className="mt-3 space-y-1.5">
              <div
                onClick={() => navigate("/admin/dashboard")}
                className={`${baseItemClasses} ${
                  isActive("/admin/dashboard") ? activeClasses : inactiveClasses
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Admin Dashboard</span>
              </div>
              <div
                onClick={() => navigate("/admin/problems")}
                className={`${baseItemClasses} ${
                  isActive("/admin/problems") ? activeClasses : inactiveClasses
                }`}
              >
                <AlertTriangle size={18} />
                <span>Manage Problems</span>
              </div>
              <div
                onClick={() => navigate("/admin/found-items")}
                className={`${baseItemClasses} ${
                  isActive("/admin/found-items")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <PackageSearch size={18} />
                <span>Found Items</span>
              </div>
              <div
                onClick={() => navigate("/admin/lostfound")}
                className={`${baseItemClasses} ${
                  isActive("/admin/lostfound") ? activeClasses : inactiveClasses
                }`}
              >
                <PackagePlus size={18} />
                <span>Lost Items</span>
              </div>
            </div>
          )}

          {/* SUPERADMIN LINKS */}
          {user?.role === "superadmin" && (
            <div className="mt-3 space-y-1.5">
              {/* Dashboard */}
              <div
                onClick={() => navigate("/superadmin/dashboard")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/dashboard")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <LayoutDashboard size={18} />
                <span>Super Admin</span>
              </div>

              {/* Add Single Student */}
              <div
                onClick={() => navigate("/superadmin/register-student")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/register-student")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <UserPlus size={18} />
                <span>Add Student</span>
              </div>

              {/* Add Single Faculty */}
              <div
                onClick={() => navigate("/superadmin/register-faculty")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/register-faculty")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <UserCheck size={18} />
                <span>Add Faculty</span>
              </div>

              {/* Bulk Upload Students */}
              <div
                onClick={() => navigate("/superadmin/bulk-upload/students")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/bulk-upload/students")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Upload size={18} />
                <span>Bulk Upload Students</span>
              </div>

              {/* Bulk Upload Faculty */}
              <div
                onClick={() => navigate("/superadmin/bulk-upload/faculty")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/bulk-upload/faculty")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Upload size={18} />
                <span>Bulk Upload Faculty</span>
              </div>

              {/* Register Functional Admin */}
              <div
                onClick={() =>
                  navigate("/superadmin/register-functional-admin")
                }
                className={`${baseItemClasses} ${
                  isActive("/superadmin/register-functional-admin")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Plus size={18} />
                <span>Functional Admin</span>
              </div>

              {/* Register Department Admin */}
              <div
                onClick={() =>
                  navigate("/superadmin/register-department-admin")
                }
                className={`${baseItemClasses} ${
                  isActive("/superadmin/register-department-admin")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Plus size={18} />
                <span>Department Admin</span>
              </div>

              {/* Manage All Admins */}
              <div
                onClick={() => navigate("/superadmin/manage-admins")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/manage-admins")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Users size={18} />
                <span>Manage Admins</span>
              </div>

              {/* Faculty Availability */}
              <div
                onClick={() => navigate("/superadmin/availability")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/availability")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <Users size={18} />
                <span>Faculty Availability</span>
              </div>

              {/* Lost & Found */}
              <div
                onClick={() => navigate("/superadmin/lostfound")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/lostfound")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <PackageSearch size={18} />
                <span>Lost & Found</span>
              </div>

              {/* Problem Reporting */}
              <div
                onClick={() => navigate("/superadmin/report-problem")}
                className={`${baseItemClasses} ${
                  isActive("/superadmin/report-problem")
                    ? activeClasses
                    : inactiveClasses
                }`}
              >
                <AlertTriangle size={18} />
                <span>Problem Reporting</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Bottom: Logout */}
      <div className="px-4 pb-6">
        <button
          onClick={handleLogout}
          className="w-full flex items-center justify-center gap-2 bg-red-500 text-white py-2.5 rounded-xl text-sm font-semibold hover:bg-red-600 transition shadow-sm"
        >
          <LogOut size={18} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
