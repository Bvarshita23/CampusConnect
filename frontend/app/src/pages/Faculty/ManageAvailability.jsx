import React, { useEffect, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { authFetch } from "../../utils/api";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "in_class", label: "In Class" },
  { value: "busy", label: "Busy" },
  { value: "on_leave", label: "On Leave" },
  { value: "unavailable", label: "Offline" },
];

const DAYS = [
  "Monday",
  "Tuesday",
  "Wednesday",
  "Thursday",
  "Friday",
  "Saturday",
  "Sunday",
];

const emptySlot = { day: "Monday", from: "09:00", to: "11:00" };

export default function ManageAvailability() {
  const [form, setForm] = useState({
    status: "available",
    message: "",
    location: "",
    nextAvailableAt: "",
    officeHours: [],
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  const user = JSON.parse(localStorage.getItem("user"));

  const loadCurrentStatus = async () => {
    if (!user?._id) return;
    try {
      setLoading(true);
      const data = await authFetch(`/faculty/status/${user._id}`);
      const status = data.status || {};
      setForm({
        status: status.status || "available",
        message: status.message || "",
        location: status.location || "",
        nextAvailableAt: status.nextAvailableAt
          ? new Date(status.nextAvailableAt).toISOString().slice(0, 16)
          : "",
        officeHours: status.officeHours?.length ? status.officeHours : [],
      });
    } catch (err) {
      console.error("Load faculty status error", err);
      toast.error(err.message || "Failed to load availability");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCurrentStatus();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const updateField = (name, value) => {
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const updateSlot = (index, key, value) => {
    setForm((prev) => {
      const next = [...prev.officeHours];
      next[index] = { ...next[index], [key]: value };
      return { ...prev, officeHours: next };
    });
  };

  const addSlot = () => {
    setForm((prev) => ({
      ...prev,
      officeHours: [...prev.officeHours, { ...emptySlot }],
    }));
  };

  const removeSlot = (index) => {
    setForm((prev) => ({
      ...prev,
      officeHours: prev.officeHours.filter((_, idx) => idx !== index),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const payload = {
        ...form,
        officeHours: form.officeHours.map((slot) => ({
          day: slot.day,
          from: slot.from,
          to: slot.to,
        })),
      };
      await authFetch("/faculty/status/me", {
        method: "PUT",
        body: JSON.stringify(payload),
      });
      toast.success("Availability updated");
      loadCurrentStatus();
    } catch (err) {
      console.error("Update availability error", err);
      toast.error(err.message || "Failed to update availability");
    } finally {
      setSaving(false);
    }
  };

  return (
    <DashboardLayout title="Manage Availability">
      <div className="bg-white p-6 md:p-8 rounded-3xl shadow border border-blue-100 max-w-4xl mx-auto">
        <div className="mb-6">
          <h2 className="text-2xl font-semibold text-gray-800">
            Availability & Office Hours
          </h2>
          <p className="text-sm text-gray-500 mt-1">
            Keep your status updated so students and administrators know when to
            reach you.
          </p>
        </div>

        {loading ? (
          <div className="py-16 text-center text-gray-500">
            Fetching current availability...
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status
                </label>
                <select
                  value={form.status}
                  onChange={(e) => updateField("status", e.target.value)}
                  className="w-full border border-blue-100 rounded-xl px-4 py-3"
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Location / Cabin
                </label>
                <input
                  value={form.location}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g., Block B - Room 204"
                  className="w-full border border-blue-100 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Next Available At
                </label>
                <input
                  type="datetime-local"
                  value={form.nextAvailableAt}
                  onChange={(e) => updateField("nextAvailableAt", e.target.value)}
                  className="w-full border border-blue-100 rounded-xl px-4 py-3"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600 mb-1">
                  Status Message
                </label>
                <input
                  value={form.message}
                  onChange={(e) => updateField("message", e.target.value)}
                  placeholder="Short note for students"
                  className="w-full border border-blue-100 rounded-xl px-4 py-3"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">
                  Office Hours
                </h3>
                <button
                  type="button"
                  onClick={addSlot}
                  className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  <Plus size={16} /> Add Slot
                </button>
              </div>

              {form.officeHours.length === 0 ? (
                <div className="text-sm text-gray-500 bg-blue-50 border border-dashed border-blue-200 rounded-xl p-4">
                  No office hours added yet. Use "Add Slot" to publish your
                  schedule.
                </div>
              ) : (
                <div className="space-y-3">
                  {form.officeHours.map((slot, index) => (
                    <div
                      key={`${slot.day}-${index}`}
                      className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-slate-50 border border-slate-200 rounded-xl p-4"
                    >
                      <select
                        value={slot.day}
                        onChange={(e) => updateSlot(index, "day", e.target.value)}
                        className="border border-blue-100 rounded-xl px-3 py-2"
                      >
                        {DAYS.map((day) => (
                          <option key={day} value={day}>
                            {day}
                          </option>
                        ))}
                      </select>
                      <input
                        type="time"
                        value={slot.from}
                        onChange={(e) => updateSlot(index, "from", e.target.value)}
                        className="border border-blue-100 rounded-xl px-3 py-2"
                      />
                      <input
                        type="time"
                        value={slot.to}
                        onChange={(e) => updateSlot(index, "to", e.target.value)}
                        className="border border-blue-100 rounded-xl px-3 py-2"
                      />
                      <button
                        type="button"
                        onClick={() => removeSlot(index)}
                        className="inline-flex items-center justify-center gap-2 text-sm text-rose-600 hover:text-rose-700"
                      >
                        <Trash2 size={16} /> Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 flex justify-end">
              <button
                type="submit"
                disabled={saving}
                className="px-6 py-3 rounded-xl bg-blue-600 text-white font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {saving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </DashboardLayout>
  );
}






