import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import FacultyStatusUpdate from "../components/FacultyStatusUpdate";
import CameraAvailability from "../components/CameraAvailability";
import ManualAvailabilityForm from "../components/ManualAvailabilityForm";
import AutoCameraDetection from "../components/AutoCameraDetection";
import {
  CalendarDays,
  Clock,
  Users,
  Pencil,
  Bell,
  CheckCircle,
  Hourglass,
  Edit3,
  Camera,
  FolderSearch,
  ClipboardList,
} from "lucide-react";
import { motion } from "framer-motion";

export default function FacultyDashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [showCamera, setShowCamera] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    const token = localStorage.getItem("token");
    if (!token || !storedUser) navigate("/login");
    else setUser(storedUser);
  }, [navigate]);

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  const upcomingSlots = [
    {
      student: "Dasari Keerthi",
      date: "Nov 7",
      time: "11:30 AM",
      topic: "Project Review Discussion",
      status: "Confirmed",
    },
    {
      student: "Raj Patel",
      date: "Nov 8",
      time: "2:00 PM",
      topic: "ML Model Clarification",
      status: "Pending",
    },
  ];

  const recentFeed = [
    {
      icon: <Users className="text-blue-500" size={20} />,
      message: "2 students booked new consultation slots today.",
      time: "1 hr ago",
    },
    {
      icon: <Bell className="text-green-500" size={20} />,
      message: "Your 3 PM slot with Varun was marked completed.",
      time: "3 hrs ago",
    },
    {
      icon: <Hourglass className="text-yellow-500" size={20} />,
      message: "Pending approval for 1 queue request.",
      time: "Yesterday",
    },
  ];

  const stats = [
    {
      label: "Total Bookings",
      value: 28,
      color: "bg-blue-100 text-blue-700",
      icon: <Users />,
    },
    {
      label: "Completed Sessions",
      value: 20,
      color: "bg-green-100 text-green-700",
      icon: <CheckCircle />,
    },
    {
      label: "Pending Requests",
      value: 4,
      color: "bg-yellow-100 text-yellow-700",
      icon: <Hourglass />,
    },
  ];

  const availabilitySlots = [
    { day: "Monday", time: "10:00 AM - 12:00 PM" },
    { day: "Wednesday", time: "2:00 PM - 4:00 PM" },
    { day: "Friday", time: "11:00 AM - 1:00 PM" },
  ];

  return (
    <DashboardLayout>
      <motion.div
        className="space-y-10 scrollbar-hide"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        {/* ===== Profile Banner ===== */}
        <div className="relative bg-gradient-to-r from-indigo-600 via-purple-500 to-pink-500 text-white rounded-3xl shadow-lg p-8 flex items-center gap-8">
          <div className="relative">
            <img
              src={user.photo ? `http://localhost:8080${user.photo}` : "/default-avatar.png"}
              alt="faculty"
              className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
            />
            <button className="absolute bottom-1 right-1 bg-white p-1 rounded-full shadow hover:scale-105 transition">
              <Camera size={18} className="text-gray-700" />
            </button>
          </div>
          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="opacity-90 text-sm">{user.email}</p>
            <div className="flex flex-wrap gap-4 mt-3">
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium">
                Dept: Computer Science
              </span>
              <span className="bg-white/20 px-4 py-1 rounded-full text-sm font-medium">
                Designation: Assistant Professor
              </span>
            </div>
          </div>
        </div>

        {/* ===== Stats Section ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {stats.map((s, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05 }}
              transition={{ type: "spring", stiffness: 200 }}
              className={`flex items-center justify-between p-6 rounded-2xl shadow-md ${s.color} border border-white`}
            >
              <div className="flex items-center gap-3 font-semibold text-lg">
                {s.icon}
                {s.label}
              </div>
              <span className="text-2xl font-bold">{s.value}</span>
            </motion.div>
          ))}
        </div>

        {/* ===== Quick Access Cards ===== */}
        <motion.div
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/faculty/lostfound")}
            className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <FolderSearch size={32} className="mb-3" />
            <h3 className="text-xl font-semibold mb-2">Lost & Found</h3>
            <p className="text-white/80 text-sm">Report or claim lost items</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/faculty/availability")}
            className="bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <Users size={32} className="mb-3" />
            <h3 className="text-xl font-semibold mb-2">Faculty Finder</h3>
            <p className="text-white/80 text-sm">Find and connect with faculty</p>
          </motion.div>
          <motion.div
            whileHover={{ scale: 1.05 }}
            onClick={() => navigate("/faculty/report-problem")}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white rounded-2xl p-6 shadow-lg cursor-pointer"
          >
            <ClipboardList size={32} className="mb-3" />
            <h3 className="text-xl font-semibold mb-2">Report Problem</h3>
            <p className="text-white/80 text-sm">Report campus issues</p>
          </motion.div>
        </motion.div>

        {/* ===== Faculty Status Update ===== */}
        <FacultyStatusUpdate />

        {/* ===== Auto Camera Detection ===== */}
        <AutoCameraDetection 
          onStatusChange={(status) => {
            console.log("Detection status changed:", status);
            // Optionally refresh status or show notification
          }}
        />

        {/* ===== Availability Management ===== */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-md border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="text-indigo-600" /> My Availability
            </h3>
            <button
              onClick={() => navigate("/faculty/availability")}
              className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm flex items-center gap-2 hover:bg-indigo-700 transition"
            >
              <Edit3 size={16} /> Edit Slots
            </button>
          </div>

          <div className="flex gap-3 mb-4">
            <button
              onClick={() => setShowCamera(true)}
              className="bg-green-600 text-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-green-700"
            >
              <Camera size={16} /> Use Camera to Mark Available
            </button>
            <button
              onClick={() => setShowManual(true)}
              className="bg-gray-100 text-gray-800 px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-200"
            >
              Manual Entry
            </button>
          </div>

          {showCamera && (
            <CameraAvailability
              onClose={() => setShowCamera(false)}
              onSuccess={(rec) => {
                setShowCamera(false);
                // optionally show toast
                console.log('Camera update success', rec);
              }}
            />
          )}

          {showManual && (
            <ManualAvailabilityForm
              onClose={() => setShowManual(false)}
              onSuccess={(rec) => {
                setShowManual(false);
                console.log('Manual update success', rec);
              }}
            />
          )}

          <div className="grid sm:grid-cols-3 gap-4">
            {availabilitySlots.map((slot, i) => (
              <div
                key={i}
                className="bg-blue-50 p-4 rounded-xl shadow-sm border border-blue-100 hover:shadow-md transition"
              >
                <h4 className="font-semibold text-gray-800">{slot.day}</h4>
                <p className="text-gray-600 text-sm mt-1">{slot.time}</p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* ===== Upcoming Bookings ===== */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-md border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
              <CalendarDays className="text-purple-600" /> Upcoming Bookings
            </h3>
            <button className="text-sm text-blue-600 hover:underline">
              View All
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 border-b">
                  <th className="py-2">Student</th>
                  <th>Date</th>
                  <th>Time</th>
                  <th>Topic</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {upcomingSlots.map((s, i) => (
                  <tr key={i} className="border-b hover:bg-blue-50 transition">
                    <td className="py-2 font-medium text-gray-800">
                      {s.student}
                    </td>
                    <td>{s.date}</td>
                    <td>{s.time}</td>
                    <td>{s.topic}</td>
                    <td
                      className={`font-medium ${
                        s.status === "Confirmed"
                          ? "text-green-600"
                          : "text-yellow-600"
                      }`}
                    >
                      {s.status}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* ===== Recent Activity Feed ===== */}
        <motion.div
          className="bg-white rounded-3xl p-6 shadow-md border border-blue-100"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="text-xl font-semibold text-gray-800 mb-4">
            Recent Activity
          </h3>
          <div className="space-y-4">
            {recentFeed.map((item, i) => (
              <div
                key={i}
                className="flex items-center justify-between bg-purple-50 rounded-xl p-3 hover:bg-purple-100 transition"
              >
                <div className="flex items-center space-x-3">
                  {item.icon}
                  <p className="text-gray-700 text-sm">{item.message}</p>
                </div>
                <span className="text-xs text-gray-500">{item.time}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </motion.div>
    </DashboardLayout>
  );
}
