import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import BulkUpload from "./components/BulkUpload";
import DepartmentAdminDashboard from "./pages/DepartmentAdminDashboard";
import FunctionalAdminDashboard from "./pages/FunctionalAdminDashboard";
import DepartmentAdminStudents from "./pages/DepartmentAdminStudents";
import DepartmentAdminFaculty from "./pages/DepartmentAdminFaculty";
import SuperAdminManageAdmins from "./pages/SuperAdminManageAdmins";
import ResetPassword from "./pages/ResetPassword";

// 🔹 Common Pages
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";

// 🔹 Dashboards
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";

// 🔹 Student Pages
import AddFoundItem from "./pages/Student/AddFoundItem";
import ReportProblem from "./pages/Student/ReportProblem.jsx";
import History from "./pages/Student/History.jsx";
import FacultyAvailability from "./pages/Student/FacultyAvailability.jsx";
import StudentQueue from "./pages/Student/Queue.jsx";

// 🔹 Unified Lost & Found Page (for all roles)
import LostFoundPage from "./pages/LostFoundPage.jsx";

// 🔹 Faculty Pages
import FacultyAvailabilityFaculty from "./pages/Faculty/FacultyAvailability.jsx";
import ReportProblemFaculty from "./pages/Faculty/ReportProblem.jsx";

// 🔹 Admin Pages
import ManageProblems from "./pages/Admin/ManageProblems.jsx";
import FacultyAvailabilityAdmin from "./pages/Admin/FacultyAvailability.jsx";
import ReportProblemAdmin from "./pages/Admin/ReportProblem.jsx";

// 🔹 SuperAdmin Pages
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import FacultyAvailabilitySuperAdmin from "./pages/SuperAdmin/FacultyAvailability.jsx";
import ReportProblemSuperAdmin from "./pages/SuperAdmin/ReportProblem.jsx";

// 🔹 Components
import Protected from "./components/Protected";
import Dashboard from "./pages/Dashboard";

function App() {
  return (
    <>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/department-admin/dashboard"
          element={
            <Protected roles={["department_admin"]}>
              <DepartmentAdminDashboard />
            </Protected>
          }
        />
        <Route
          path="/department-admin/faculty"
          element={
            <Protected roles={["department_admin"]}>
              <DepartmentAdminFaculty />
            </Protected>
          }
        />
        <Route
          path="/superadmin/manage-admins"
          element={
            <Protected roles={["superadmin"]}>
              <SuperAdminManageAdmins />
            </Protected>
          }
        />
        <Route path="/reset-password/:token" element={<ResetPassword />} />
        <Route
          path="/functional-admin/dashboard"
          element={
            <Protected roles={["functional_admin"]}>
              <FunctionalAdminDashboard />
            </Protected>
          }
        />

        {/* 🛡️ SuperAdmin Protected Routes */}
        <Route
          path="/superadmin/dashboard"
          element={
            <Protected roles={["superadmin"]}>
              <SuperAdminDashboard />
            </Protected>
          }
        />
        {/* ✅ Lost & Found page for superadmin */}
        <Route
          path="/superadmin/lostfound"
          element={
            <Protected roles={["superadmin"]}>
              <LostFoundPage />
            </Protected>
          }
        />
        {/* ✅ Faculty Availability page for superadmin */}
        <Route
          path="/superadmin/availability"
          element={
            <Protected roles={["superadmin"]}>
              <FacultyAvailabilitySuperAdmin />
            </Protected>
          }
        />
        {/* ✅ Problem Reporting page for superadmin */}
        <Route
          path="/superadmin/report-problem"
          element={
            <Protected roles={["superadmin"]}>
              <ReportProblemSuperAdmin />
            </Protected>
          }
        />

        {/* 🧑‍🎓 Student Protected Routes */}
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
          path="/department-admin/students"
          element={
            <Protected roles={["department_admin"]}>
              <DepartmentAdminStudents />
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
        {/* ✅ Unified Lost & Found Route for Student, Faculty, and Admin */}
        <Route
          path="/student/lostfound"
          element={
            <Protected roles={["student", "faculty", "admin"]}>
              <LostFoundPage />
            </Protected>
          }
        />
        <Route
          path="/student/availability"
          element={
            <Protected roles={["student"]}>
              <FacultyAvailability />
            </Protected>
          }
        />
        <Route
          path="/student/queue"
          element={
            <Protected roles={["student"]}>
              <StudentQueue />
            </Protected>
          }
        />
        <Route
          path="/student/history"
          element={
            <Protected roles={["student"]}>
              <History />
            </Protected>
          }
        />

        {/* 👩‍🏫 Faculty Protected Routes */}
        <Route
          path="/faculty/dashboard"
          element={
            <Protected roles={["faculty"]}>
              <FacultyDashboard />
            </Protected>
          }
        />
        {/* ✅ Lost & Found page for faculty */}
        <Route
          path="/faculty/lostfound"
          element={
            <Protected roles={["faculty", "student", "admin"]}>
              <LostFoundPage />
            </Protected>
          }
        />
        {/* ✅ Faculty Availability page for faculty */}
        <Route
          path="/faculty/availability"
          element={
            <Protected roles={["faculty"]}>
              <FacultyAvailabilityFaculty />
            </Protected>
          }
        />
        {/* ✅ Problem Reporting page for faculty */}
        <Route
          path="/faculty/report-problem"
          element={
            <Protected roles={["faculty"]}>
              <ReportProblemFaculty />
            </Protected>
          }
        />

        {/* 🧑‍💼 Admin Protected Routes */}
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
        {/* ✅ Lost & Found page for admin */}
        <Route
          path="/admin/lostfound"
          element={
            <Protected roles={["admin", "faculty", "student"]}>
              <LostFoundPage />
            </Protected>
          }
        />
        {/* ✅ Faculty Availability page for admin */}
        <Route
          path="/admin/availability"
          element={
            <Protected roles={["admin"]}>
              <FacultyAvailabilityAdmin />
            </Protected>
          }
        />
        {/* ✅ Problem Reporting page for admin */}
        <Route
          path="/admin/report-problem"
          element={
            <Protected roles={["admin"]}>
              <ReportProblemAdmin />
            </Protected>
          }
        />

        {/* 🔹 Bulk upload routes */}
        <Route
          path="/bulk-upload/students"
          element={
            <Protected roles={["superadmin", "department_admin"]}>
              <BulkUpload type="student" />
            </Protected>
          }
        />
        <Route
          path="/bulk-upload/faculty"
          element={
            <Protected roles={["superadmin", "department_admin"]}>
              <BulkUpload type="faculty" />
            </Protected>
          }
        />
        <Route
          path="/bulk-upload/admins"
          element={
            <Protected roles={["superadmin"]}>
              <BulkUpload type="admin" />
            </Protected>
          }
        />

        {/* 🧭 Common Dashboard (Fallback or shared landing) */}
        <Route
          path="/dashboard"
          element={
            <Protected roles={["student", "faculty", "admin"]}>
              <Dashboard />
            </Protected>
          }
        />
      </Routes>

      {/* 🔔 Global Toast Notifications */}
      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
