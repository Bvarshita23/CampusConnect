// InitialAvatar.jsx
import React from "react";

export default function InitialAvatar({ name = "", size = 40 }) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      style={{
        width: size,
        height: size,
      }}
      className="rounded-full bg-blue-600 text-white flex items-center justify-center font-semibold shadow"
    >
      {initials || "?"}
    </div>
  );
}
