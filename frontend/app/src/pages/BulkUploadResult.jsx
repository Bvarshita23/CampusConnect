import React from "react";
import { useLocation, Link } from "react-router-dom";

export default function BulkUploadResult() {
  const { state } = useLocation();

  if (!state) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-600">
        No upload result found.
      </div>
    );
  }

  const { role, results } = state;

  const Section = ({ title, items, color }) => (
    <div className="mb-8">
      <h3 className={`text-xl font-bold mb-2 text-${color}-600`}>
        {title} ({items.length})
      </h3>

      {items.length === 0 ? (
        <p className="text-gray-500">None</p>
      ) : (
        <table className="w-full text-sm bg-white shadow rounded-lg overflow-hidden">
          <thead className={`bg-${color}-100`}>
            <tr>
              {Object.keys(items[0]).map((key) => (
                <th key={key} className="px-3 py-2 text-left capitalize">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={idx} className="border-t">
                {Object.values(item).map((val, i) => (
                  <td key={i} className="px-3 py-2">
                    {val}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-4xl mx-auto bg-white shadow-lg rounded-2xl p-8">
        <h2 className="text-3xl font-bold text-center text-sky-700 mb-6">
          Bulk Upload Summary ({role})
        </h2>

        <Section title="Added" items={results.added} color="green" />
        <Section title="Replaced" items={results.replaced} color="yellow" />
        <Section title="Skipped" items={results.skipped} color="gray" />

        <div className="text-center mt-6">
          <Link to="/superadmin/dashboard">
            <button className="px-6 py-2 bg-sky-600 text-white rounded-xl hover:bg-sky-700">
              ← Back to Dashboard
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
