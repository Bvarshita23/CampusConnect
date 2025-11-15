import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  FolderSearch,
  ClipboardList,
  Users,
  Clock,
  Menu,
  X,
  LogOut,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import TopNavbar from "./TopNavbar";

export default function DashboardLayout({ title, children }) {
  const navigate = useNavigate();
  const userStr = localStorage.getItem("user");
  const user = userStr ? JSON.parse(userStr) : null;
  const [collapsed, setCollapsed] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Safely get user role with fallback
  const userRole = user?.role?.toLowerCase() || "";

  // If no user role, show minimal layout (Protected component should handle redirect)
  // This prevents crashes while Protected redirects
  if (!userRole) {
    return (
      <div className="flex bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen overflow-hidden">
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center">
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  const allLinks = [
    {
      name: "Dashboard",
      icon: <LayoutDashboard size={22} />,
      path: `/${userRole}/dashboard`,
      roles: ["student", "faculty", "admin", "superadmin"],
    },
    {
      name: "Lost & Found",
      icon: <FolderSearch size={22} />,
      path: `/${userRole}/lostfound`,
      roles: ["student", "faculty", "admin", "superadmin"],
    },
    {
      name: "Problems",
      icon: <ClipboardList size={22} />,
      path: `/${userRole}/report-problem`,
      roles: ["student", "faculty", "admin", "superadmin"],
    },
    {
      name: "Faculty",
      icon: <Users size={22} />,
      path: `/${userRole}/availability`,
      roles: ["student", "faculty", "admin", "superadmin"],
    },
    {
      name: "Queue Management",
      icon: <Clock size={22} />,
      path: `/${userRole}/queue`,
      roles: ["student"], // Only for students
    },
  ];

  // Filter links based on user role
  const links = allLinks.filter((link) => 
    link.roles.includes(userRole)
  );

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex bg-gradient-to-br from-blue-50 to-blue-100 min-h-screen overflow-hidden">
      {/* ===== Desktop Sidebar ===== */}
      <motion.aside
        onMouseEnter={() => setCollapsed(false)}
        onMouseLeave={() => setCollapsed(true)}
        animate={{ width: collapsed ? 80 : 240 }}
        transition={{ duration: 0.3 }}
        className="hidden md:flex flex-col justify-between bg-white shadow-lg h-screen fixed left-0 top-0 z-20"
      >
        <div className="flex flex-col items-center md:items-start w-full px-4 py-6">
          <h1
            className={`text-blue-600 font-bold mb-8 transition-all ${
              collapsed ? "text-sm text-center" : "text-xl px-2"
            }`}
          >
            {collapsed ? "CC" : "Campus Connect"}
          </h1>

          <nav className="space-y-3 w-full">
            {links.map((link) => (
              <button
                key={link.name}
                onClick={() => navigate(link.path)}
                className={`flex items-center w-full text-left px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition ${
                  collapsed ? "justify-center" : "space-x-3"
                }`}
              >
                {link.icon}
                {!collapsed && <span>{link.name}</span>}
              </button>
            ))}
          </nav>
        </div>

        <button
          onClick={handleLogout}
          className={`flex items-center justify-center space-x-2 bg-red-500 text-white py-2 mx-4 mb-6 rounded-lg hover:bg-red-600 transition ${
            collapsed ? "justify-center" : ""
          }`}
        >
          <LogOut size={18} />
          {!collapsed && <span>Logout</span>}
        </button>
      </motion.aside>

      {/* ===== Mobile Hamburger Button ===== */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setSidebarOpen(true)}
          className="bg-white shadow p-2 rounded-md hover:bg-blue-50"
        >
          <Menu size={26} className="text-blue-700" />
        </button>
      </div>

      {/* ===== Mobile Sidebar ===== */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            <motion.div
              key="overlay"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40"
              onClick={() => setSidebarOpen(false)}
            />
            <motion.div
              key="sidebar"
              initial={{ x: -300 }}
              animate={{ x: 0 }}
              exit={{ x: -300 }}
              transition={{ type: "spring", stiffness: 120, damping: 18 }}
              className="fixed inset-y-0 left-0 w-64 bg-white shadow-xl z-50 rounded-r-2xl p-6 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-center mb-8">
                  <h2 className="text-xl font-bold text-blue-600">
                    Campus Connect
                  </h2>
                  <button onClick={() => setSidebarOpen(false)}>
                    <X size={24} className="text-gray-700 hover:text-red-500" />
                  </button>
                </div>
                <nav className="space-y-3">
                  {links.map((link) => (
                    <button
                      key={link.name}
                      onClick={() => {
                        navigate(link.path);
                        setSidebarOpen(false);
                      }}
                      className="flex items-center space-x-3 w-full text-left px-3 py-2 rounded-lg hover:bg-blue-100 hover:text-blue-700 transition"
                    >
                      {link.icon}
                      <span>{link.name}</span>
                    </button>
                  ))}
                </nav>
              </div>

              <button
                onClick={handleLogout}
                className="flex items-center justify-center space-x-2 bg-red-500 text-white py-2 w-full rounded-lg hover:bg-red-600 transition"
              >
                <LogOut size={18} />
                <span>Logout</span>
              </button>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* ===== Main Content Area ===== */}
      <div className="flex-1 md:ml-[80px] lg:ml-[240px] min-h-screen flex flex-col">
        <TopNavbar />
        <main className="flex-1 p-8 overflow-y-auto scrollbar-hide bg-gradient-to-b from-white via-blue-50 to-blue-100">
          {title && (
            <h2 className="text-3xl font-semibold text-gray-800 mb-6">
              {title}
            </h2>
          )}
          {children}
        </main>
      </div>
    </div>
  );
}
