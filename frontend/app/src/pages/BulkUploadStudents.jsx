import React, { useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

export default function BulkUploadStudents() {
  const navigate = useNavigate();
  const [zipFile, setZipFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!zipFile) {
      alert("Please select a ZIP file containing only the Excel sheet.");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("token");

      const formData = new FormData();
      formData.append("zipFile", zipFile);

      const res = await axios.post(
        "/api/v1/auth/bulk-upload/students",
        formData,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "multipart/form-data",
          },
        }
      );

      navigate("/superadmin/bulk-upload/result", {
        state: {
          role: "student",
          results: res.data.results,
        },
      });
    } catch (err) {
      console.error(err);
      alert(
        err.response?.data?.message ||
          "Bulk upload failed. Check console for details."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white w-full max-w-xl shadow-xl p-8 rounded-2xl">
        <h2 className="text-3xl font-bold text-center mb-3 text-sky-700">
          Bulk Upload Students
        </h2>

        <p className="text-center text-gray-500 mb-6">
          Upload a ZIP containing only <strong>one Excel file (.xlsx)</strong>.
        </p>

        <label className="block mb-6">
          <span className="font-semibold">ZIP File (.zip)</span>
          <input
            type="file"
            accept=".zip"
            onChange={(e) => setZipFile(e.target.files[0])}
            className="block w-full mt-2"
          />
          {zipFile && (
            <p className="text-xs text-gray-500 mt-1">
              Selected: {zipFile.name}
            </p>
          )}
        </label>

        <button
          onClick={handleSubmit}
          disabled={loading}
          className="w-full bg-sky-600 text-white py-3 rounded-xl font-semibold hover:bg-sky-700 transition"
        >
          {loading ? "Uploading..." : "Upload ZIP"}
        </button>

        <button
          onClick={() => navigate(-1)}
          className="block mx-auto mt-6 text-sky-700 hover:underline"
        >
          ← Go Back
        </button>
      </div>
    </div>
  );
}
