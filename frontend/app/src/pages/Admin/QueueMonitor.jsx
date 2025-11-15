import React, { useEffect, useMemo, useState } from "react";
import { ClipboardList, RefreshCcw } from "lucide-react";
import DashboardLayout from "../../components/DashboardLayout";
import { authFetch } from "../../utils/api";
import toast from "react-hot-toast";

const STATUS_OPTIONS = [
  { value: "waiting", label: "Waiting" },
  { value: "called", label: "Called" },
  { value: "serving", label: "Serving" },
  { value: "completed", label: "Completed" },
  { value: "cancelled", label: "Cancelled" },
];

const STATUS_META = {
  waiting: "bg-blue-100 text-blue-700",
  called: "bg-emerald-100 text-emerald-700",
  serving: "bg-amber-100 text-amber-700",
  completed: "bg-slate-100 text-slate-600",
  cancelled: "bg-rose-100 text-rose-700",
};

export default function QueueMonitor() {
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState("");
  const [tickets, setTickets] = useState([]);
  const [statusFilter, setStatusFilter] = useState("waiting");
  const [loading, setLoading] = useState(false);

  const fetchServices = async () => {
    try {
      const data = await authFetch("/queue/admin/services");
      setServices(data.services || []);
      if (!selectedService && data.services?.length) {
        setSelectedService(data.services[0]);
      }
    } catch (err) {
      console.error("Load services error", err);
      toast.error(err.message || "Failed to load queue services");
    }
  };

  const fetchQueue = async () => {
    if (!selectedService) return;
    try {
      setLoading(true);
      const query = new URLSearchParams();
      if (statusFilter) query.append("status", statusFilter);
      const data = await authFetch(
        `/queue/admin/service/${encodeURIComponent(selectedService)}?${query.toString()}`
      );
      setTickets(data.tickets || []);
    } catch (err) {
      console.error("Load queue error", err);
      toast.error(err.message || "Failed to load queue");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (ticketId, value) => {
    try {
      await authFetch(`/queue/admin/${ticketId}`, {
        method: "PATCH",
        body: JSON.stringify({ status: value }),
      });
      toast.success("Ticket updated");
      fetchQueue();
    } catch (err) {
      console.error("Update ticket error", err);
      toast.error(err.message || "Failed to update ticket");
    }
  };

  useEffect(() => {
    fetchServices();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    fetchQueue();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedService, statusFilter]);

  const filteredTickets = useMemo(() => tickets, [tickets]);

  return (
    <DashboardLayout title="Queue Monitor">
      <div className="space-y-6">
        <div className="bg-white rounded-3xl shadow border border-blue-100 p-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-gray-800 flex items-center gap-2">
              <ClipboardList className="text-purple-600" size={22} /> Active Queues
            </h2>
            <p className="text-sm text-gray-500">
              Track live queues, call next students, or close completed tickets.
            </p>
          </div>
          <button
            onClick={fetchQueue}
            className="inline-flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700"
          >
            <RefreshCcw size={16} /> Refresh
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <select
            value={selectedService}
            onChange={(e) => setSelectedService(e.target.value)}
            className="bg-white p-3 rounded-xl shadow border border-blue-100 text-sm"
          >
            <option value="">Select a Service</option>
            {services.map((service) => (
              <option key={service} value={service}>
                {service}
              </option>
            ))}
          </select>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="bg-white p-3 rounded-xl shadow border border-blue-100 text-sm"
          >
            {STATUS_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div className="bg-white rounded-3xl shadow border border-blue-100">
          {!selectedService ? (
            <div className="py-16 text-center text-gray-500">
              Select a service to view its live queue.
            </div>
          ) : loading ? (
            <div className="py-16 text-center text-gray-500">
              Loading queue data...
            </div>
          ) : filteredTickets.length === 0 ? (
            <div className="py-16 text-center text-gray-500">
              No tickets found for this filter.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-500 border-b">
                    <th className="py-3 px-6">Ticket</th>
                    <th className="py-3 px-6">Student</th>
                    <th className="py-3 px-6">Status</th>
                    <th className="py-3 px-6">Position</th>
                    <th className="py-3 px-6">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredTickets.map((ticket) => (
                    <tr key={ticket._id} className="border-b hover:bg-purple-50/50">
                      <td className="py-3 px-6 font-semibold text-gray-700">
                        {ticket.ticketNumber}
                      </td>
                      <td className="py-3 px-6">
                        <div className="font-medium text-gray-700">
                          {ticket.user?.name || "-"}
                        </div>
                        <div className="text-xs text-gray-500">
                          {ticket.user?.email}
                        </div>
                      </td>
                      <td className="py-3 px-6">
                        <span
                          className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                            STATUS_META[ticket.status] || STATUS_META.waiting
                          }`}
                        >
                          {STATUS_OPTIONS.find((s) => s.value === ticket.status)?.label ||
                            ticket.status}
                        </span>
                      </td>
                      <td className="py-3 px-6">{ticket.position || "-"}</td>
                      <td className="py-3 px-6">
                        <select
                          value={ticket.status}
                          onChange={(e) => handleStatusChange(ticket._id, e.target.value)}
                          className="border border-blue-100 rounded-lg px-2 py-1 text-sm"
                        >
                          {STATUS_OPTIONS.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </DashboardLayout>
  );
}






