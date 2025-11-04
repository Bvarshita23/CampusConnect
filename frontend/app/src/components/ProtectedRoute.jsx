import React from "react";
import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children, allowedRole }) {
  const user = JSON.parse(localStorage.getItem("user"));
  const role = user?.role?.toLowerCase();

  if (!user) {
    // Not logged in
    return <Navigate to="/login" />;
  }

  if (role !== allowedRole) {
    // Logged in but not allowed (e.g., student trying to open admin)
    return <Navigate to={`/${role}/dashboard`} />;
  }

  // ✅ Allowed user
  return children;
}
