import { Navigate } from "react-router-dom";

export default function Protected({ children, roles }) {
  const token = localStorage.getItem("token");
  const user = JSON.parse(localStorage.getItem("user") || "{}");

  // ⛔ If no token/user, redirect to login
  if (!token || !user?.role) {
    return <Navigate to="/login" replace />;
  }

  // 🚫 Role restriction check
  if (roles && !roles.includes(user.role.toLowerCase())) {
    return <Navigate to="/" replace />;
  }

  // ✅ Otherwise render page
  return children;
}
