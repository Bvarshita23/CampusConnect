import React from "react";

export default function Navbar({ user, onLogout }) {
  const getRoleLabel = () => {
    switch (user.role) {
      case "student":
        return "Student";
      case "faculty":
        return "Faculty";
      case "admin":
        return "Admin";
      case "department_admin":
        return "Department Admin";
      case "functional_admin":
        return "Functional Admin";
      case "superadmin":
        return "Super Admin";
      default:
        return "User";
    }
  };

  return (
    <nav className="w-full bg-[#0A66C2] text-white flex justify-between items-center px-6 py-3 shadow-md">
      <h1 className="text-lg sm:text-xl font-bold tracking-wide">
        Campus Connect
      </h1>

      <div className="flex items-center space-x-4">
        <span className="hidden sm:block bg-white text-[#0A66C2] font-semibold px-3 py-1 rounded-full text-sm">
          {getRoleLabel()}
        </span>

        <img
          src={user.photo || "/default-avatar.png"}
          alt="Profile"
          className="w-10 h-10 rounded-full border-2 border-white object-cover"
        />

        <button
          onClick={onLogout}
          className="bg-white text-[#0A66C2] font-semibold px-3 py-1 rounded-md hover:bg-blue-50 transition"
        >
          Logout
        </button>
      </div>
    </nav>
  );
}
