import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "../api/axiosConfig";
import DashboardLayout from "../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import { authFetch } from "../utils/api";

const StudentDashboard = () => {
  const navigate = useNavigate();
  const [problems, setProblems] = useState([]);
  const [lostFound, setLostFound] = useState([]);
  const [queueTickets, setQueueTickets] = useState([]);
  const [availableFaculty, setAvailableFaculty] = useState([]);
  const [activeTab, setActiveTab] = useState("active");
  const [selectedItem, setSelectedItem] = useState(null);
  const [showModal, setShowModal] = useState(false);

  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user"));

  // ✅ Fetch all data
  useEffect(() => {
    const fetchData = async () => {
      try {
        const headers = { Authorization: `Bearer ${token}` };
        const [pRes, lRes, qRes, facultyRes] = await Promise.all([
          axios.get("/api/v1/problems/my", { headers }),
          axios.get("/api/v1/lostfound", { headers }),
          axios.get("/api/v1/queue/my", { headers }),
          authFetch("/faculty/status?status=Available").catch(() => ({ statuses: [] })),
        ]);

        setProblems(pRes.data.problems || []);
        setLostFound(lRes.data.items || []);
        setQueueTickets(qRes.data.tickets || []);
        setAvailableFaculty(facultyRes?.statuses || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, [token]);

  // ✅ Filters
  const activeProblems = problems.filter((p) => p.status !== "Resolved");
  const historyProblems = problems.filter((p) => p.status === "Resolved");

  const activeLostFound = lostFound.filter(
    (i) => !["verified", "returned", "matched"].includes(i.status)
  );
  const historyLostFound = lostFound.filter((i) =>
    ["verified", "returned", "matched"].includes(i.status)
  );

  const activeQueue = queueTickets.filter(
    (q) => !["completed", "cancelled"].includes(q.status)
  );
  const historyQueue = queueTickets.filter((q) =>
    ["completed", "cancelled"].includes(q.status)
  );

  // ✅ Modal handler
  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  const closeModal = () => {
    setSelectedItem(null);
    setShowModal(false);
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="p-6 space-y-8">
        {/* ===== Profile Card ===== */}
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-3xl shadow-2xl p-6 flex flex-wrap md:flex-nowrap items-center justify-between">
          <div className="space-y-1">
            <h2 className="text-2xl font-bold mb-1">{user.name}</h2>
            <p className="text-white/90 text-sm">USN: {user.usn || "N/A"}</p>
            <p className="text-white/90 text-sm">
              Branch: {user.department || "N/A"}
            </p>
            <p className="text-white/90 text-sm">
              Year: {user.year ? `${user.year} Year` : "N/A"}
            </p>
          </div>
          <img
            src={
              user.photo
                ? `http://localhost:8080${user.photo}`
                : "https://i.pravatar.cc/100"
            }
            alt="Profile"
            className="w-24 h-24 mt-4 md:mt-0 rounded-full border-4 border-white object-cover"
          />
        </div>

        {/* ===== Available Faculty Quick View ===== */}
        {availableFaculty.length > 0 && (
          <motion.div
            className="bg-gradient-to-r from-emerald-500 to-teal-600 text-white rounded-3xl shadow-lg p-6"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Users size={32} />
                <div>
                  <h3 className="text-xl font-bold">
                    {availableFaculty.length} Faculty Available Now
                  </h3>
                  <p className="text-white/90 text-sm">
                    Click to view all faculty and their availability
                  </p>
                </div>
              </div>
              <button
                onClick={() => navigate("/student/availability")}
                className="bg-white text-emerald-600 px-6 py-3 rounded-xl font-semibold hover:bg-emerald-50 transition flex items-center gap-2"
              >
                View All Faculty
                <ArrowRight size={20} />
              </button>
            </div>
            <div className="mt-4 flex flex-wrap gap-2">
              {availableFaculty.slice(0, 5).map((item) => (
                <div
                  key={item.faculty?._id}
                  className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium"
                >
                  {item.faculty?.name || "Unknown"}
                </div>
              ))}
              {availableFaculty.length > 5 && (
                <div className="bg-white/20 backdrop-blur-sm px-4 py-2 rounded-lg text-sm font-medium">
                  +{availableFaculty.length - 5} more
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ===== Tabs ===== */}
        <div className="flex justify-center mb-4">
          {["active", "history"].map((tab, index) => (
            <button
              key={`tab-${index}`}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full mx-2 ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white text-indigo-600 border border-indigo-300"
              }`}
            >
              {tab === "active" ? "🟡 Active" : "📜 History"}
            </button>
          ))}
        </div>

        {/* ===== Main Content Grid ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "active" ? (
            <>
              {/* ===== Problems ===== */}
              {activeProblems.map((p, i) => (
                <div
                  key={`problem-${p._id || i}`}
                  className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => openModal(p)}
                >
                  <h2 className="font-semibold text-indigo-700">{p.title}</h2>
                  <p className="text-sm text-gray-500">{p.category}</p>
                  <p className="mt-2 text-gray-700 line-clamp-3">
                    {p.description}
                  </p>
                  <span className="text-xs mt-2 inline-block bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                    {p.status}
                  </span>
                </div>
              ))}

              {/* ===== Lost & Found ===== */}
              {activeLostFound.map((i, idx) => (
                <div
                  key={`lost-${i._id || idx}`}
                  className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => openModal(i)}
                >
                  <h2 className="font-semibold text-teal-700">{i.title}</h2>
                  <p className="text-sm text-gray-500">
                    {i.type?.toUpperCase()}
                  </p>
                  <p className="mt-2 text-gray-700 line-clamp-3">
                    {i.description}
                  </p>
                  <span className="text-xs mt-2 inline-block bg-orange-200 text-orange-800 px-2 py-1 rounded">
                    {i.status}
                  </span>
                </div>
              ))}

              {/* ===== Queue ===== */}
              {activeQueue.map((q, qIndex) => (
                <div
                  key={`queue-${q._id || qIndex}`}
                  className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer"
                  onClick={() => openModal(q)}
                >
                  <h2 className="font-semibold text-pink-700">
                    {q.service} Queue
                  </h2>
                  <p className="text-sm text-gray-500">
                    Position #{q.position}
                  </p>
                  <p className="mt-2 text-gray-700 line-clamp-3">
                    {q.description}
                  </p>
                  <span className="text-xs mt-2 inline-block bg-blue-200 text-blue-800 px-2 py-1 rounded">
                    {q.status}
                  </span>
                </div>
              ))}
            </>
          ) : (
            <>
              {/* ===== History Section ===== */}
              {[...historyProblems, ...historyLostFound, ...historyQueue].map(
                (h, index) => (
                  <div
                    key={`history-${
                      h._id || h.id || h.title || h.service || index
                    }`}
                    className="bg-white p-5 rounded-2xl shadow border-l-4 border-green-500 hover:shadow-lg transition cursor-pointer"
                    onClick={() => openModal(h)}
                  >
                    <h2 className="font-semibold text-green-700">
                      {h.title || h.service}
                    </h2>
                    <p className="text-sm text-gray-500">
                      {h.category || h.type || "Queue"}
                    </p>
                    <p className="mt-2 text-gray-700 line-clamp-3">
                      {h.description || "Completed successfully."}
                    </p>
                    <span className="text-xs mt-2 inline-block bg-green-200 text-green-800 px-2 py-1 rounded">
                      {h.status}
                    </span>
                  </div>
                )
              )}
            </>
          )}
        </div>

        {/* ===== Modal for Item Details ===== */}
        <AnimatePresence>
          {showModal && selectedItem && (
            <motion.div
              className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="bg-white p-6 rounded-3xl shadow-2xl w-[90%] max-w-md relative"
                initial={{ scale: 0.9, y: -10 }}
                animate={{ scale: 1, y: 0 }}
                exit={{ scale: 0.9, y: -10 }}
              >
                <button
                  onClick={closeModal}
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
                >
                  ✖
                </button>
                <h2 className="text-2xl font-semibold text-indigo-700 mb-3">
                  {selectedItem.title || selectedItem.service}
                </h2>
                <p className="text-gray-600 mb-2">
                  <strong>Category:</strong>{" "}
                  {selectedItem.category || selectedItem.type || "N/A"}
                </p>
                <p className="text-gray-600 mb-2">
                  <strong>Status:</strong> {selectedItem.status}
                </p>
                <p className="text-gray-700 mb-4">
                  {selectedItem.description || "No description provided."}
                </p>
                <button
                  onClick={closeModal}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700"
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
};

export default StudentDashboard;
