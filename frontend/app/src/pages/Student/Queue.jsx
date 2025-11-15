import React, { useEffect, useState } from "react";
import { Clock, Ticket, XCircle, Info, Users, Bell, MessageSquare, Star } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { authFetch } from "../../utils/api";
import toast from "react-hot-toast";

const STATUS_META = {
  waiting: { label: "Waiting", badge: "bg-blue-100 text-blue-700" },
  called: { label: "Called", badge: "bg-emerald-100 text-emerald-700" },
  serving: { label: "Serving", badge: "bg-amber-100 text-amber-700" },
  completed: { label: "Completed", badge: "bg-slate-100 text-slate-600" },
  cancelled: { label: "Cancelled", badge: "bg-rose-100 text-rose-700" },
};

const SUGGESTED_SERVICES = [
  "Administration Office",
  "Library Helpdesk",
  "Scholarship Cell",
  "Hostel Office",
  "Transport Desk",
];

export default function StudentQueue() {
  const [form, setForm] = useState({
    service: "",
    department: "",
    description: "",
    entryMethod: "physical", // physical, remote, virtual
    notifications: {
      sms: false,
      email: true,
      whatsapp: false,
    },
  });
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const fetchTickets = async () => {
    try {
      setLoading(true);
      const data = await authFetch("/queue/my");
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Queue load error", err);
      toast.error(err.message || "Failed to load queue tickets");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTickets();
    // Auto-refresh every 30 seconds
    const interval = setInterval(fetchTickets, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("notification_")) {
      const notifType = name.replace("notification_", "");
      setForm((prev) => ({
        ...prev,
        notifications: {
          ...prev.notifications,
          [notifType]: checked,
        },
      }));
    } else {
      setForm((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.service.trim()) {
      toast.error("Please select a service");
      return;
    }
    try {
      setSubmitting(true);
      const payload = {
        service: form.service.trim(),
        department: form.department.trim(),
        description: form.description.trim(),
        entryMethod: form.entryMethod,
        notifications: form.notifications,
      };
      await authFetch("/queue", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      toast.success("Queue ticket created successfully");
      setForm({
        service: "",
        department: "",
        description: "",
        entryMethod: "physical",
        notifications: { sms: false, email: true, whatsapp: false },
      });
      fetchTickets();
    } catch (err) {
      console.error("Queue create error", err);
      toast.error(err.message || "Failed to create queue ticket");
    } finally {
      setSubmitting(false);
    }
  };

  const handleCancel = async (ticketId) => {
    if (!window.confirm("Cancel this queue ticket?")) return;
    try {
      await authFetch(`/queue/${ticketId}`, { method: "DELETE" });
      toast.success("Ticket cancelled");
      fetchTickets();
    } catch (err) {
      console.error("Queue cancel error", err);
      toast.error(err.message || "Failed to cancel ticket");
    }
  };

  const handleFeedback = async (ticketId) => {
    const rating = prompt("Rate your experience (1-5):");
    if (rating && rating >= 1 && rating <= 5) {
      try {
        await authFetch(`/queue/${ticketId}/feedback`, {
          method: "POST",
          body: JSON.stringify({ rating: parseInt(rating) }),
        });
        toast.success("Thank you for your feedback!");
      } catch (err) {
        toast.error("Failed to submit feedback");
      }
    }
  };

  return (
    <DashboardLayout title="Queue Management">
      <div className="space-y-6">
        {/* How It Works Section */}
        <div className="bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 text-white rounded-3xl shadow-2xl p-8">
          <h2 className="text-3xl font-bold mb-2 text-center">
            How It <span className="text-blue-300">Works</span>?
          </h2>
          <p className="text-center text-blue-100 mb-8">
            Learn about the process of efficient and streamlined Queue Management
          </p>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            {/* Step 1 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  1
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Various Queue Entry Points</h3>
              <p className="text-sm text-blue-100 text-center">
                Enable customer entry in a queue through different options such as physical, remote, virtual, etc.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  2
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Display Estimated Waiting Times</h3>
              <p className="text-sm text-blue-100 text-center">
                We decode the approximate wait times and our software notifies the customers so they can utilize the waiting time accordingly.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  3
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Instant Alerts and Notifications</h3>
              <p className="text-sm text-blue-100 text-center">
                Customers get regular alerts about the queue movement and get notified via SMS, Email, or WhatsApp about their turn.
              </p>
            </div>

            {/* Step 4 */}
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 border border-white/20">
              <div className="flex items-center justify-center mb-4">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center text-3xl font-bold">
                  4
                </div>
              </div>
              <h3 className="text-xl font-bold mb-3 text-center">Request Customer Feedback</h3>
              <p className="text-sm text-blue-100 text-center">
                Once the customer is attended, we send out a feedback request about their overall experience and the customer service received at the premises.
              </p>
            </div>
          </div>
        </div>

        {/* Join Queue Form */}
        <div className="bg-white rounded-3xl shadow-md border border-blue-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
                <Ticket className="text-indigo-600" size={24} /> Join a Queue
              </h2>
              <p className="text-sm text-gray-500 mt-1">
                Reserve your spot digitally and receive live updates on your turn.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Service / Office *
                </label>
                <input
                  list="service-options"
                  name="service"
                  value={form.service}
                  onChange={handleChange}
                  placeholder="e.g., Administration Office"
                  className="w-full border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                  required
                />
                <datalist id="service-options">
                  {SUGGESTED_SERVICES.map((service) => (
                    <option key={service} value={service} />
                  ))}
                </datalist>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Department (optional)
                </label>
                <input
                  name="department"
                  value={form.department}
                  onChange={handleChange}
                  placeholder="e.g., CSE"
                  className="w-full border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Entry Method *
              </label>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { value: "physical", label: "Physical", icon: Users },
                  { value: "remote", label: "Remote", icon: Clock },
                  { value: "virtual", label: "Virtual", icon: MessageSquare },
                ].map((method) => {
                  const Icon = method.icon;
                  return (
                    <label
                      key={method.value}
                      className={`flex flex-col items-center p-4 border-2 rounded-xl cursor-pointer transition ${
                        form.entryMethod === method.value
                          ? "border-blue-500 bg-blue-50"
                          : "border-gray-200 hover:border-blue-300"
                      }`}
                    >
                      <input
                        type="radio"
                        name="entryMethod"
                        value={method.value}
                        checked={form.entryMethod === method.value}
                        onChange={handleChange}
                        className="hidden"
                      />
                      <Icon size={24} className="text-blue-600 mb-2" />
                      <span className="text-sm font-medium">{method.label}</span>
                    </label>
                  );
                })}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notification Preferences
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="notification_sms"
                    checked={form.notifications.sms}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm">SMS</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="notification_email"
                    checked={form.notifications.email}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm">Email</span>
                </label>
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="notification_whatsapp"
                    checked={form.notifications.whatsapp}
                    onChange={handleChange}
                    className="rounded"
                  />
                  <span className="text-sm">WhatsApp</span>
                </label>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Purpose / Notes
              </label>
              <textarea
                name="description"
                value={form.description}
                onChange={handleChange}
                rows="3"
                placeholder="Give a quick summary so the staff can prepare ahead."
                className="w-full border border-blue-100 rounded-xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-blue-200"
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-indigo-600 text-white py-3 rounded-xl font-semibold hover:bg-indigo-700 disabled:opacity-60 disabled:cursor-not-allowed transition flex items-center justify-center gap-2"
            >
              {submitting ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Adding...
                </>
              ) : (
                <>
                  <Ticket size={20} /> Join Queue
                </>
              )}
            </button>
          </form>
        </div>

        {/* My Queue Tickets */}
        <div className="bg-white rounded-3xl shadow-md border border-blue-100">
          <div className="flex items-center justify-between p-6 border-b border-blue-50">
            <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <Clock className="text-blue-600" size={20} /> My Queue Tickets
            </h3>
          </div>

          {loading ? (
            <div className="py-12 text-center text-gray-500">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-2">Loading queue tickets...</p>
            </div>
          ) : tickets.length === 0 ? (
            <div className="py-12 text-center text-gray-500">
              You have not joined any queues yet.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b bg-gray-50">
                    <th className="py-3 px-6">Ticket</th>
                    <th className="py-3 px-6">Service</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Position</th>
                    <th className="py-3 px-6">Entry Method</th>
                    <th className="py-3 px-6">ETA</th>
                    <th className="py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tickets.map((ticket) => {
                    const meta = STATUS_META[ticket.status] || STATUS_META.waiting;
                    return (
                      <tr
                        key={ticket._id}
                        className="border-b hover:bg-blue-50/40 transition"
                      >
                        <td className="py-3 px-6 font-medium text-gray-800">
                          {ticket.ticketNumber}
                        </td>
                        <td className="py-3 px-6">
                          <div className="font-medium text-gray-700">
                            {ticket.service}
                          </div>
                          {ticket.description && (
                            <div className="text-xs text-gray-500 mt-1 line-clamp-2">
                              {ticket.description}
                            </div>
                          )}
                        </td>
                        <td className="py-3 px-6">
                          <span
                            className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${meta.badge}`}
                          >
                            {meta.label}
                          </span>
                        </td>
                        <td className="py-3 px-6">
                          {ticket.status === "waiting" ||
                          ticket.status === "called"
                            ? `#${ticket.position || "-"}`
                            : "-"}
                        </td>
                        <td className="py-3 px-6">
                          <span className="capitalize text-gray-600">
                            {ticket.entryMethod || "Physical"}
                          </span>
                        </td>
                        <td className="py-3 px-6 text-gray-600">
                          {ticket.estimatedTime
                            ? new Date(ticket.estimatedTime).toLocaleTimeString()
                            : "--"}
                        </td>
                        <td className="py-3 px-6">
                          <div className="flex gap-2">
                            {ticket.status === "waiting" && (
                              <button
                                onClick={() => handleCancel(ticket._id)}
                                className="inline-flex items-center gap-1 text-sm text-rose-600 hover:text-rose-700"
                              >
                                <XCircle size={16} /> Cancel
                              </button>
                            )}
                            {ticket.status === "completed" && (
                              <button
                                onClick={() => handleFeedback(ticket._id)}
                                className="inline-flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                              >
                                <Star size={16} /> Feedback
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}
