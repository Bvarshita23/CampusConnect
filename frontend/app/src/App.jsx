import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import AddFoundItem from "./pages/Student/AddFoundItem";
import ReportProblem from "./pages/Student/ReportProblem.jsx";
import ManageProblems from "./pages/Admin/ManageProblems.jsx";
import Protected from "./components/Protected";

export default function App() {
  return (
    <>
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />

        {/* Student Protected */}
        <Route
          path="/student/dashboard"
          element={
            <Protected roles={["student"]}>
              <StudentDashboard />
            </Protected>
          }
        />
        <Route
          path="/student/add-found"
          element={
            <Protected roles={["student"]}>
              <AddFoundItem />
            </Protected>
          }
        />
        <Route
          path="/student/report-problem"
          element={
            <Protected roles={["student"]}>
              <ReportProblem />
            </Protected>
          }
        />

        {/* Faculty Protected */}
        <Route
          path="/faculty/dashboard"
          element={
            <Protected roles={["faculty"]}>
              <FacultyDashboard />
            </Protected>
          }
        />

        {/* Admin Protected */}
        <Route
          path="/admin/dashboard"
          element={
            <Protected roles={["admin"]}>
              <AdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/admin/problems"
          element={
            <Protected roles={["admin", "faculty"]}>
              <ManageProblems />
            </Protected>
          }
        />
      </Routes>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}
