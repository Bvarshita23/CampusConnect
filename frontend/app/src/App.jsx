import React from "react";
import { Routes, Route } from "react-router-dom";
import { Toaster } from "react-hot-toast";

/* ------------------- Single Add Pages ------------------- */
import AddSingleStudent from "./pages/AddSingleStudent";
import AddSingleFaculty from "./pages/AddSingleFaculty";

/* ------------------- Bulk Upload Pages ------------------- */
import BulkUploadStudents from "./pages/BulkUploadStudents.jsx";
import BulkUploadFaculty from "./pages/BulkUploadFaculty.jsx";
import BulkUploadResult from "./pages/BulkUploadResult.jsx";

/* ------------------- Admin Registration Pages ------------------- */
import RegisterFunctionalAdmin from "./pages/RegisterFunctionalAdmin.jsx";
import RegisterDepartmentAdmin from "./pages/RegisterDepartmentAdmin.jsx";

/* ------------------- Department Admin Pages ------------------- */
import DepartmentAdminDashboard from "./pages/DepartmentAdminDashboard";
import DepartmentAdminStudents from "./pages/DepartmentAdminStudents";
import DepartmentAdminFaculty from "./pages/DepartmentAdminFaculty";

/* ------------------- Functional Admin Pages ------------------- */
import FunctionalAdminDashboard from "./pages/FunctionalAdminDashboard";
import EditUser from "./pages/EditUser.jsx";

/* ------------------- Super Admin Pages ------------------- */
import SuperAdminDashboard from "./pages/SuperAdminDashboard";
import SuperAdminManageAdmins from "./pages/SuperAdminManageAdmins";
import FacultyAvailabilitySuperAdmin from "./pages/SuperAdmin/FacultyAvailability.jsx";
import ReportProblemSuperAdmin from "./pages/SuperAdmin/ReportProblem.jsx";

/* ------------------- Other Dashboards ------------------- */
import AdminDashboard from "./pages/AdminDashboard";
import FacultyDashboard from "./pages/FacultyDashboard";
import StudentDashboard from "./pages/StudentDashboard";
import Dashboard from "./pages/Dashboard";

/* ------------------- Auth Pages ------------------- */
import LandingPage from "./pages/LandingPage";
import LoginPage from "./pages/LoginPage";
import ForgotPassword from "./pages/ForgotPassword";
import ResetPassword from "./pages/ResetPassword";

/* ------------------- Student Pages ------------------- */
import AddFoundItem from "./pages/Student/AddFoundItem";
import ReportProblem from "./pages/Student/ReportProblem.jsx";
import FacultyAvailability from "./pages/Student/FacultyAvailability.jsx";
import StudentQueue from "./pages/Student/Queue.jsx";
import History from "./pages/Student/History.jsx";

/* ------------------- Faculty Pages ------------------- */
import FacultyAvailabilityFaculty from "./pages/Faculty/FacultyAvailability.jsx";
import ReportProblemFaculty from "./pages/Faculty/ReportProblem.jsx";

/* ------------------- Admin Pages ------------------- */
import ManageProblems from "./pages/Admin/ManageProblems.jsx";
import FacultyAvailabilityAdmin from "./pages/Admin/FacultyAvailability.jsx";
import ReportProblemAdmin from "./pages/Admin/ReportProblem.jsx";

/* ------------------- Lost & Found (shared) ------------------- */
import LostFoundPage from "./pages/LostFoundPage.jsx";

/* ------------------- Components ------------------- */
import Protected from "./components/Protected";

function App() {
  return (
    <>
      <Routes>
        {/* 🌐 Public Routes */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/reset-password/:token" element={<ResetPassword />} />

        {/* Legacy Add Routes (do not delete if used somewhere) */}
        <Route path="/add-student" element={<AddSingleStudent />} />
        <Route path="/add-faculty" element={<AddSingleFaculty />} />

        {/* ------------------- SuperAdmin Routes ------------------- */}
        <Route
          path="/superadmin/dashboard"
          element={
            <Protected roles={["superadmin"]}>
              <SuperAdminDashboard />
            </Protected>
          }
        />

        {/* 🔥 NEW WORKING ROUTES (Your missing ones) */}
        <Route
          path="/superadmin/register-student"
          element={
            <Protected roles={["superadmin"]}>
              <AddSingleStudent />
            </Protected>
          }
        />

        <Route
          path="/superadmin/register-faculty"
          element={
            <Protected roles={["superadmin"]}>
              <AddSingleFaculty />
            </Protected>
          }
        />

        {/* Bulk Upload for SuperAdmin */}
        <Route
          path="/superadmin/bulk-upload/students"
          element={
            <Protected roles={["superadmin"]}>
              <BulkUploadStudents />
            </Protected>
          }
        />
        <Route
          path="/superadmin/bulk-upload/faculty"
          element={
            <Protected roles={["superadmin"]}>
              <BulkUploadFaculty />
            </Protected>
          }
        />

        {/* Admin Registration */}
        <Route
          path="/superadmin/register-functional-admin"
          element={
            <Protected roles={["superadmin"]}>
              <RegisterFunctionalAdmin />
            </Protected>
          }
        />

        <Route
          path="/superadmin/register-department-admin"
          element={
            <Protected roles={["superadmin"]}>
              <RegisterDepartmentAdmin />
            </Protected>
          }
        />

        <Route
          path="/superadmin/lostfound"
          element={
            <Protected roles={["superadmin"]}>
              <LostFoundPage />
            </Protected>
          }
        />

        <Route
          path="/superadmin/availability"
          element={
            <Protected roles={["superadmin"]}>
              <FacultyAvailabilitySuperAdmin />
            </Protected>
          }
        />

        <Route
          path="/superadmin/report-problem"
          element={
            <Protected roles={["superadmin"]}>
              <ReportProblemSuperAdmin />
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

        <Route
          path="/superadmin/edit-user/:id"
          element={
            <Protected roles={["superadmin"]}>
              <EditUser />
            </Protected>
          }
        />

        {/* ------------------- Department Admin Routes ------------------- */}
        <Route
          path="/department-admin/dashboard"
          element={
            <Protected roles={["department_admin"]}>
              <DepartmentAdminDashboard />
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
          path="/department-admin/faculty"
          element={
            <Protected roles={["department_admin"]}>
              <DepartmentAdminFaculty />
            </Protected>
          }
        />

        {/* ------------------- Functional Admin Routes ------------------- */}
        <Route
          path="/functional-admin/dashboard"
          element={
            <Protected roles={["functional_admin"]}>
              <FunctionalAdminDashboard />
            </Protected>
          }
        />

        {/* ------------------- Student Routes ------------------- */}
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
          path="/superadmin/bulk-upload/result"
          element={
            <Protected roles={["superadmin", "department_admin"]}>
              <BulkUploadResult />
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
        <Route
          path="/admin/faculty-availability"
          element={
            <Protected roles={["admin", "superadmin"]}>
              <FacultyAvailability />
            </Protected>
          }
        />

        <Route
          path="/superadmin/faculty-availability"
          element={
            <Protected roles={["superadmin"]}>
              <FacultyAvailability />
            </Protected>
          }
        />
        {/* ------------------- Faculty Routes ------------------- */}
        <Route
          path="/faculty/dashboard"
          element={
            <Protected roles={["faculty"]}>
              <FacultyDashboard />
            </Protected>
          }
        />

        <Route
          path="/faculty/lostfound"
          element={
            <Protected roles={["faculty", "student", "admin"]}>
              <LostFoundPage />
            </Protected>
          }
        />

        <Route
          path="/faculty/availability"
          element={
            <Protected roles={["faculty"]}>
              <FacultyAvailabilityFaculty />
            </Protected>
          }
        />

        <Route
          path="/faculty/report-problem"
          element={
            <Protected roles={["faculty"]}>
              <ReportProblemFaculty />
            </Protected>
          }
        />

        {/* ------------------- Admin Routes ------------------- */}
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

        <Route
          path="/admin/lostfound"
          element={
            <Protected roles={["admin", "faculty", "student"]}>
              <LostFoundPage />
            </Protected>
          }
        />

        <Route
          path="/admin/availability"
          element={
            <Protected roles={["admin"]}>
              <FacultyAvailabilityAdmin />
            </Protected>
          }
        />

        <Route
          path="/admin/report-problem"
          element={
            <Protected roles={["admin"]}>
              <ReportProblemAdmin />
            </Protected>
          }
        />

        {/* ------------------- Common Dashboard ------------------- */}
        <Route
          path="/dashboard"
          element={
            <Protected roles={["student", "faculty", "admin"]}>
              <Dashboard />
            </Protected>
          }
        />
      </Routes>

      <Toaster position="top-center" reverseOrder={false} />
    </>
  );
}

export default App;
