import React, { useState } from "react";
import FoundItems from "./FoundItems";
import LostItems from "./LostItems";
import AddFoundItem from "./AddFoundItem";

export default function LostFound() {
  const [view, setView] = useState("found");
  const [refreshFlag, setRefreshFlag] = useState(false);

  return (
    <section className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl sm:text-3xl font-semibold text-[#0A66C2] flex items-center gap-2">
          {view === "found" ? "📦 Found Items" : "🧳 Lost Items"}
        </h2>

        <button
          onClick={() => setView(view === "found" ? "lost" : "found")}
          className="bg-[#0A66C2] text-white px-4 py-2 rounded-lg shadow hover:shadow-md transition"
        >
          {view === "found" ? "View Lost Items" : "View Found Items"}
        </button>
      </div>

      {/* Dynamic Component Rendering */}
      {view === "found" ? (
        <FoundItems key={refreshFlag} />
      ) : (
        <LostItems key={refreshFlag} />
      )}

      <div className="fixed bottom-6 right-6">
        <button
          onClick={() => setRefreshFlag((p) => !p)}
          className="bg-[#0A66C2] text-white px-4 py-2 rounded-full shadow-lg hover:scale-105 transition"
        >
          ⟳ Refresh
        </button>
      </div>
    </section>
  );
}
