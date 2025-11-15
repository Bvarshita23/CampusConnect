import React from "react";
import { motion } from "framer-motion";

export default function DashboardCard({
  icon,
  title,
  description,
  actionText,
  onClick,
}) {
  return (
    <motion.div
      whileHover={{ scale: 1.03 }}
      className="bg-white shadow-md rounded-xl p-5 flex flex-col items-start justify-between hover:shadow-lg transition"
    >
      <div className="text-[#0A66C2] text-3xl mb-3">{icon}</div>
      <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
      <p className="text-gray-500 text-sm mt-1 flex-grow">{description}</p>
      <button
        onClick={onClick}
        className="mt-3 bg-[#0A66C2] text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-[#004182] transition w-full text-center"
      >
        {actionText}
      </button>
    </motion.div>
  );
}
