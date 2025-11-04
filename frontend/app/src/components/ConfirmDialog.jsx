import React from "react";

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  message,
}) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40 backdrop-blur-sm z-50">
      <div className="bg-white rounded-2xl shadow-2xl p-6 w-[90%] max-w-md animate-fadeIn">
        <h3 className="text-xl font-semibold text-gray-800 mb-2">
          {title || "Confirm Action"}
        </h3>
        <p className="text-gray-600 mb-5">{message || "Are you sure?"}</p>
        <div className="flex justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 transition"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            className="px-5 py-2 rounded-lg bg-[#0A66C2] text-white hover:bg-[#004182] transition"
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}
