import React from "react";

export default function ProfileCard({ user }) {
  const currentYear = new Date().getFullYear();
  const expiryYear = user.role === "student" ? user.admissionYear + 4 : null;

  const isActive =
    user.role === "student"
      ? currentYear <= expiryYear
      : user.isActive !== false;

  return (
    <div className="bg-white shadow-md rounded-xl p-5 mt-5 flex flex-col sm:flex-row items-center sm:items-start gap-5">
      <img
        src={user.photo || "/default-avatar.png"}
        alt="Profile"
        className="w-24 h-24 rounded-full object-cover border-4 border-blue-100"
      />
      <div className="flex-1 text-center sm:text-left">
        <h2 className="text-2xl font-semibold text-[#0A66C2]">{user.name}</h2>
        {user.role === "student" ? (
          <>
            <p className="text-gray-600 mt-1">USN: {user.usn}</p>
            <p className="text-gray-600">
              Branch: {user.branch} | Year: {user.year}
            </p>
            <p
              className={`mt-2 text-sm font-medium ${
                isActive ? "text-green-600" : "text-red-500"
              }`}
            >
              {isActive
                ? `Access valid till: May ${expiryYear}`
                : "Access expired"}
            </p>
          </>
        ) : (
          <>
            <p className="text-gray-600 mt-1">
              Branch: {user.branch} | {user.designation}
            </p>
            <p className="text-gray-600">Experience: {user.experience} years</p>
            <p
              className={`mt-2 text-sm font-medium ${
                isActive ? "text-green-600" : "text-red-500"
              }`}
            >
              {isActive ? "Active Faculty" : "Inactive"}
            </p>
          </>
        )}
      </div>
    </div>
  );
}
