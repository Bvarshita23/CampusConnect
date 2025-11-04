import React from "react";
import { useNavigate, Outlet, Link } from "react-router-dom";
import { Home, Users, LogOut, ClipboardList, Bell } from "lucide-react";
import LogoutButton from "./LogoutButton";

export default function DashboardLayout({ role }) {
  const navigate = useNavigate();

  const menuItems = {
    admin: [
      { name: "Dashboard", icon: <Home size={18} />, path: "/admin/dashboard" },
      { name: "Manage Users", icon: <Users size={18} />, path: "/admin/users" },
      {
        name: "Announcements",
        icon: <Bell size={18} />,
        path: "/admin/announcements",
      },
    ],
    faculty: [
      {
        name: "Dashboard",
        icon: <Home size={18} />,
        path: "/faculty/dashboard",
      },
      {
        name: "Availability",
        icon: <ClipboardList size={18} />,
        path: "/faculty/availability",
      },
      {
        name: "Announcements",
        icon: <Bell size={18} />,
        path: "/faculty/announcements",
      },
    ],
    student: [
      {
        name: "Dashboard",
        icon: <Home size={18} />,
        path: "/student/dashboard",
      },
      {
        name: "Lost & Found",
        icon: <ClipboardList size={18} />,
        path: "/student/lostfound",
      },
      {
        name: "Complaints",
        icon: <Bell size={18} />,
        path: "/student/complaints",
      },
    ],
  };

  const links = menuItems[role] || [];

  return (
    <div className="flex min-h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-white shadow-md flex flex-col justify-between">
        <div>
          <div className="p-4 border-b">
            <h1 className="text-xl font-bold text-blue-700 text-center">
              CampusConnect
            </h1>
            <p className="text-sm text-center text-gray-500 capitalize">
              {role}
            </p>
          </div>

          <nav className="p-4 space-y-2">
            {links.map((item) => (
              <Link
                key={item.name}
                to={item.path}
                className="flex items-center gap-3 px-3 py-2 rounded-md text-gray-700 hover:bg-blue-50 hover:text-blue-700 transition-all"
              >
                {item.icon}
                <span>{item.name}</span>
              </Link>
            ))}
          </nav>
        </div>

        <div className="p-4 border-t">
          <LogoutButton />
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 flex flex-col">
        <header className="bg-white shadow-sm p-4 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-700">Dashboard</h2>
          <span className="text-sm text-gray-500">
            Welcome, {role.charAt(0).toUpperCase() + role.slice(1)} 👋
          </span>
        </header>

        <section className="p-6">
          <Outlet />
        </section>
      </main>
    </div>
  );
}
