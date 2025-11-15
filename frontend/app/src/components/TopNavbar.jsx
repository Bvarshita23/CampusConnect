import React, { useState, useEffect } from "react";
import { Moon, Sun, Bell, ChevronDown, LogOut, User } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";

export default function TopNavbar() {
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [notifications, setNotifications] = useState(0); // starts from 0
  const user = JSON.parse(localStorage.getItem("user")) || {
    name: "User",
    role: "student",
  };

  // ✅ Load dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      document.documentElement.classList.add("dark");
      setDarkMode(true);
    }
  }, []);

  // ✅ Toggle dark mode
  const toggleTheme = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (newMode) {
      document.documentElement.classList.add("dark");
      localStorage.setItem("theme", "dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("theme", "light");
    }
  };

  // ✅ Fetch notifications dynamically
  useEffect(() => {
    const token = localStorage.getItem("token");

    const fetchNotifications = async () => {
      try {
        // This endpoint doesn’t exist yet — later you’ll add it in backend
        const res = await fetch(
          "http://localhost:8080/api/v1/notifications/my",
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );
        if (!res.ok) throw new Error("Failed to fetch notifications");
        const data = await res.json();
        setNotifications(data.count || data.notifications?.length || 0);
      } catch (err) {
        console.warn("Notification fetch skipped:", err.message);
      }
    };

    fetchNotifications();

    // Optional: auto-refresh every 45 seconds
    const interval = setInterval(fetchNotifications, 45000);
    return () => clearInterval(interval);
  }, []);

  // ✅ Logout handler
  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  return (
    <div className="flex items-center justify-between bg-white/70 dark:bg-gray-900/70 backdrop-blur-md border-b border-gray-200 dark:border-gray-700 px-6 py-3 sticky top-0 z-50">
      {/* ===== Left side - App title ===== */}
      <h1 className="text-lg font-semibold text-blue-700 dark:text-blue-300 tracking-wide">
        Campus Connect
      </h1>

      {/* ===== Right side - Icons and user menu ===== */}
      <div className="flex items-center space-x-5">
        {/* 🌙 Dark/Light Toggle */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition"
        >
          {darkMode ? (
            <Sun size={20} className="text-yellow-400" />
          ) : (
            <Moon size={20} className="text-gray-600" />
          )}
        </button>

        {/* 🔔 Notifications */}
        <div className="relative">
          <button
            className="p-2 rounded-full hover:bg-blue-50 dark:hover:bg-gray-800 transition relative"
            onClick={() => setNotifications(0)} // clears badge on click
          >
            <Bell size={20} className="text-gray-600 dark:text-gray-300" />
            {notifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[10px] px-[5px] py-[1px] rounded-full">
                {notifications}
              </span>
            )}
          </button>
        </div>

        {/* 👤 User Info & Dropdown */}
        <div className="relative">
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center space-x-2 hover:bg-blue-50 dark:hover:bg-gray-800 px-3 py-1.5 rounded-lg transition"
          >
            <img
              src={
                user.photo
                  ? `http://localhost:8080${user.photo}`
                  : "/default-avatar.png"
              }
              alt="profile"
              className="w-8 h-8 rounded-full border border-gray-200 object-cover"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <div className="text-left">
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                {user.name}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                {user.role}
              </p>
            </div>
            <ChevronDown
              size={16}
              className={`transition-transform ${
                dropdownOpen ? "rotate-180" : ""
              } text-gray-600 dark:text-gray-400`}
            />
          </button>

          {/* Dropdown Menu */}
          <AnimatePresence>
            {dropdownOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="absolute right-0 mt-2 w-40 bg-white dark:bg-gray-800 shadow-xl rounded-lg overflow-hidden border border-gray-100 dark:border-gray-700"
              >
                <button
                  onClick={() => navigate("/profile")}
                  className="flex items-center w-full px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-blue-50 dark:hover:bg-gray-700"
                >
                  <User size={16} className="mr-2" /> Profile
                </button>
                <button
                  onClick={handleLogout}
                  className="flex items-center w-full px-4 py-2 text-sm text-red-600 hover:bg-red-50 dark:hover:bg-gray-700"
                >
                  <LogOut size={16} className="mr-2" /> Logout
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
