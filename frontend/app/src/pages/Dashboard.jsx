import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProfileCard from "../components/ProfileCard";
import DashboardCard from "../components/DashboardCard";
import { FileSearch, AlertTriangle, Users, Bell } from "lucide-react";

export default function Dashboard() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  console.log("✅ Dashboard component loaded");

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    if (!token || !storedUser) {
      navigate("/login");
      return;
    }
    setUser(JSON.parse(storedUser));
  }, [navigate]);

  const handleLogout = () => {
    localStorage.clear();
    navigate("/login");
  };

  if (!user) return <div className="text-center mt-20">Loading...</div>;

  // 🎓 same grid + cards as before
  return (
    <div className="min-h-screen bg-gradient-to-b from-white via-blue-50 to-blue-100">
      <Navbar user={user} onLogout={handleLogout} />
      <div className="max-w-6xl mx-auto px-4 py-6">
        <ProfileCard user={user} />

        {/* Cards */}
        <div className="mt-8 grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
          <DashboardCard
            icon={<FileSearch />}
            title="Lost & Found"
            description="Report or view lost and found items on campus."
            actionText="Open"
            onClick={() => navigate("/lostfound")}
          />
          <DashboardCard
            icon={<AlertTriangle />}
            title="Problem Reporting"
            description="Report issues in campus facilities or services."
            actionText="Report"
            onClick={() => navigate("/problems")}
          />
          <DashboardCard
            icon={<Users />}
            title="Faculty Availability"
            description={
              user.role === "faculty"
                ? "Update your availability for students to see."
                : "Check your faculty's office hours."
            }
            actionText={
              user.role === "faculty"
                ? "Edit Availability"
                : "View Availability"
            }
            onClick={() =>
              navigate(
                user.role === "faculty"
                  ? "/faculty/availability"
                  : "/student/availability"
              )
            }
          />
          <DashboardCard
            icon={<Bell />}
            title="Notifications"
            description="View recent alerts and campus updates."
            actionText="View"
            onClick={() => navigate("/notifications")}
          />
        </div>
      </div>
    </div>
  );
}
