import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import DashboardLayout from "../components/DashboardLayout";
import { motion, AnimatePresence } from "framer-motion";
import { Users, ArrowRight } from "lucide-react";
import api from "../utils/api"; // ✅ FIXED — this is the ONLY import you need

// ⭐ Initial Avatar Component
const InitialAvatar = ({ name }) => {
  const letter = name?.trim()?.charAt(0)?.toUpperCase() || "?";
  return (
    <div className="w-28 h-28 rounded-full bg-white text-indigo-700 flex items-center justify-center font-bold text-4xl shadow-md border-4 border-white">
      {letter}
    </div>
  );
};

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

  // FETCH DATA
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [pRes, lRes, qRes, facultyRes] = await Promise.all([
          api.get("/problems/my"),
          api.get("/lostfound"),
          api.get("/queue/my"),
          api
            .get("/faculty/status?status=Available")
            .catch(() => ({ data: { statuses: [] } })),
        ]);

        setProblems(pRes.data.problems || []);
        setLostFound(lRes.data.items || []);
        setQueueTickets(qRes.data.tickets || []);
        setAvailableFaculty(facultyRes.data.statuses || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      }
    };

    fetchData();
    const interval = setInterval(fetchData, 30000);
    return () => clearInterval(interval);
  }, []);

  // FILTERS
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

  const openModal = (item) => {
    setSelectedItem(item);
    setShowModal(true);
  };

  return (
    <DashboardLayout title="Student Dashboard">
      <div className="p-6 space-y-8">
        {/* ===== PROFILE ===== */}
        <section className="bg-gradient-to-r from-sky-500 to-indigo-600 text-white rounded-3xl shadow-lg p-6 flex flex-wrap md:flex-nowrap items-center justify-between gap-6">
          <div>
            <h2 className="text-3xl font-bold">{user.name}</h2>
            <p className="text-white/90 mt-1">USN: {user.usn}</p>
            <p className="text-white/90">Department: {user.department}</p>
            <p className="text-white/90">Year: {user.year}</p>
          </div>

          <InitialAvatar name={user.name} />
        </section>

        {/* ===== AVAILABLE FACULTY ===== */}
        {availableFaculty.length > 0 && (
          <motion.div
            className="bg-white rounded-2xl shadow border border-emerald-200 p-6"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-3">
                <Users className="text-emerald-600" size={32} />
                <div>
                  <h3 className="text-xl font-semibold text-emerald-700">
                    {availableFaculty.length} Faculty Available
                  </h3>
                  <p className="text-gray-500 text-sm">
                    Click to view full availability list.
                  </p>
                </div>
              </div>

              <button
                onClick={() => navigate("/student/availability")}
                className="bg-emerald-600 text-white px-6 py-3 rounded-xl hover:bg-emerald-700 transition flex items-center gap-2"
              >
                View All <ArrowRight size={18} />
              </button>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              {availableFaculty.slice(0, 5).map((f, idx) => (
                <div
                  key={idx}
                  className="px-4 py-2 rounded-lg bg-emerald-50 text-emerald-700 border border-emerald-200"
                >
                  {f.faculty?.name}
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* ===== TABS ===== */}
        <div className="flex justify-center gap-3">
          {["active", "history"].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-6 py-2 rounded-full font-semibold transition ${
                activeTab === tab
                  ? "bg-indigo-600 text-white"
                  : "bg-white border border-indigo-300 text-indigo-600"
              }`}
            >
              {tab === "active" ? "🟡 Active" : "📜 History"}
            </button>
          ))}
        </div>

        {/* ===== LIST ITEMS ===== */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {activeTab === "active"
            ? [...activeProblems, ...activeLostFound, ...activeQueue].map(
                (item, i) => (
                  <div
                    key={i}
                    onClick={() => openModal(item)}
                    className="bg-white p-5 rounded-2xl shadow hover:shadow-lg transition cursor-pointer border border-gray-100"
                  >
                    <h2 className="text-indigo-700 font-semibold text-lg">
                      {item.title || item.service}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {item.category || item.type || "Queue"}
                    </p>
                    <p className="mt-2 text-gray-700 line-clamp-3">
                      {item.description}
                    </p>
                    <span className="inline-block mt-3 text-xs bg-yellow-200 text-yellow-800 px-2 py-1 rounded">
                      {item.status}
                    </span>
                  </div>
                )
              )
            : [...historyProblems, ...historyLostFound, ...historyQueue].map(
                (item, i) => (
                  <div
                    key={i}
                    onClick={() => openModal(item)}
                    className="bg-white p-5 rounded-2xl shadow border-l-4 border-green-500 hover:shadow-lg cursor-pointer"
                  >
                    <h2 className="text-green-700 font-semibold text-lg">
                      {item.title || item.service}
                    </h2>
                    <p className="text-gray-500 text-sm">
                      {item.category || item.type || "Queue"}
                    </p>
                    <p className="mt-2 text-gray-700 line-clamp-3">
                      {item.description}
                    </p>
                    <span className="inline-block mt-3 text-xs bg-green-200 text-green-800 px-2 py-1 rounded">
                      {item.status}
                    </span>
                  </div>
                )
              )}
        </div>

        {/* ===== MODAL ===== */}
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
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                exit={{ scale: 0.9 }}
              >
                <button
                  onClick={() => setShowModal(false)}
                  className="absolute top-3 right-3 text-gray-600 hover:text-red-500"
                >
                  ✖
                </button>
                <h2 className="text-2xl font-bold text-indigo-700">
                  {selectedItem.title || selectedItem.service}
                </h2>
                <p className="mt-2 text-gray-600">
                  <strong>Status:</strong> {selectedItem.status}
                </p>
                <p className="mt-1 text-gray-700">{selectedItem.description}</p>

                <button
                  onClick={() => setShowModal(false)}
                  className="mt-5 bg-indigo-600 text-white px-4 py-2 rounded-lg w-full hover:bg-indigo-700"
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
