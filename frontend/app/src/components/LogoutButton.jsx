import React from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

export default function LogoutButton() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    toast.success("You've been logged out!");
    navigate("/login");
  };

  return (
    <button
      onClick={handleLogout}
      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md shadow-md transition-all duration-200"
    >
      Logout
    </button>
  );
}
