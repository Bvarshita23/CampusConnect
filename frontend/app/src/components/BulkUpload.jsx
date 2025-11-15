import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import {
  Upload,
  FileSpreadsheet,
  Image,
  CheckCircle,
  XCircle,
} from "lucide-react";

export default function BulkUpload({ type }) {
  const [excelFile, setExcelFile] = useState(null);
  const [images, setImages] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [summary, setSummary] = useState(null);

  const handleExcelChange = (e) => {
    setExcelFile(e.target.files[0]);
  };

  const handleImagesChange = (e) => {
    setImages(Array.from(e.target.files));
  };

  const handleSubmit = async () => {
    if (!excelFile) {
      toast.error("Please upload the Excel file");
      return;
    }

    setUploading(true);
    setSummary(null);

    const formData = new FormData();
    formData.append("file", excelFile);

    images.forEach((img) => {
      formData.append("images", img);
    });

    try {
      const res = await axios.post(`/api/v1/${type}/bulk-upload`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      setSummary(res.data.summary || null);
      toast.success("Upload completed successfully!");
    } catch (err) {
      toast.error("Upload failed!");
      console.error(err);
    }

    setUploading(false);
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6 flex justify-center">
      <div className="bg-white shadow-xl rounded-2xl p-8 w-full max-w-4xl">
        {/* Page Header */}
        <h1 className="text-3xl font-bold text-blue-700 mb-6">
          Bulk Upload – {type.toUpperCase()}
        </h1>

        {/* Upload Box */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Excel Upload */}
          <div className="border-2 border-dashed border-blue-300 bg-blue-50 p-6 rounded-xl hover:bg-blue-100 transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <FileSpreadsheet size={40} className="text-blue-600" />
              <div>
                <h2 className="font-semibold text-blue-700">
                  Upload Excel File
                </h2>
                <p className="text-gray-600 text-sm">Format: .xlsx only</p>
              </div>
            </div>
            <input
              type="file"
              accept=".xlsx"
              className="w-full mt-4"
              onChange={handleExcelChange}
            />
            {excelFile && (
              <p className="text-sm mt-2 text-green-600">
                Selected: {excelFile.name}
              </p>
            )}
          </div>

          {/* Photo Upload */}
          <div className="border-2 border-dashed border-green-300 bg-green-50 p-6 rounded-xl hover:bg-green-100 transition cursor-pointer">
            <div className="flex items-center space-x-4">
              <Image size={40} className="text-green-600" />
              <div>
                <h2 className="font-semibold text-green-700">Upload Photos</h2>
                <p className="text-gray-600 text-sm">Multiple photos allowed</p>
              </div>
            </div>
            <input
              type="file"
              accept="image/*"
              multiple
              className="w-full mt-4"
              onChange={handleImagesChange}
            />
            {images.length > 0 && (
              <p className="text-sm mt-2 text-green-600">
                {images.length} image(s) selected
              </p>
            )}
          </div>
        </div>

        {/* Upload Button */}
        <button
          onClick={handleSubmit}
          disabled={uploading}
          className="mt-8 w-full py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition font-semibold"
        >
          {uploading ? "Uploading..." : "Start Upload"}
        </button>

        {/* Summary Box */}
        {summary && (
          <div className="mt-10 bg-gray-50 p-6 rounded-xl shadow">
            <h2 className="text-xl font-bold text-gray-700 mb-4">
              Upload Summary
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="p-4 bg-green-100 rounded-xl flex items-center space-x-4">
                <CheckCircle size={32} className="text-green-700" />
                <div>
                  <p className="font-semibold text-green-700">Added</p>
                  <p>{summary.added || 0}</p>
                </div>
              </div>

              <div className="p-4 bg-yellow-100 rounded-xl flex items-center space-x-4">
                <Upload size={32} className="text-yellow-700" />
                <div>
                  <p className="font-semibold text-yellow-700">Updated</p>
                  <p>{summary.updated || 0}</p>
                </div>
              </div>

              <div className="p-4 bg-blue-100 rounded-xl flex items-center space-x-4">
                <XCircle size={32} className="text-blue-700" />
                <div>
                  <p className="font-semibold text-blue-700">Skipped</p>
                  <p>{summary.skipped || 0}</p>
                </div>
              </div>

              <div className="p-4 bg-red-100 rounded-xl flex items-center space-x-4">
                <XCircle size={32} className="text-red-700" />
                <div>
                  <p className="font-semibold text-red-700">Errors</p>
                  <p>{summary.errors || 0}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
