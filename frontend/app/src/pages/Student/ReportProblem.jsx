import { useState } from "react";
import { authFetch } from "../../utils/api";
import { toast } from "react-hot-toast";

const CATEGORIES = [
  "Infrastructure",
  "IT",
  "Academic",
  "Hostel",
  "Admin",
  "Other",
];

export default function ReportProblem() {
  const [form, setForm] = useState({
    title: "",
    description: "",
    category: "Other",
    department: "",
  });
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      await authFetch("/problems", {
        method: "POST",
        body: JSON.stringify(form),
      });
      toast.success("Problem submitted");
      setForm({
        title: "",
        description: "",
        category: "Other",
        department: "",
      });
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Report a Problem</h1>
      <form onSubmit={onSubmit} className="grid gap-4 max-w-2xl">
        <input
          name="title"
          value={form.title}
          onChange={onChange}
          placeholder="Title"
          className="border rounded-xl p-3"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={onChange}
          placeholder="Describe the issue..."
          rows={6}
          className="border rounded-xl p-3"
          required
        />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            name="category"
            value={form.category}
            onChange={onChange}
            className="border rounded-xl p-3"
          >
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <input
            name="department"
            value={form.department}
            onChange={onChange}
            placeholder="Department (e.g., CSE, IT, Facilities)"
            className="border rounded-xl p-3"
            required
          />
        </div>
        <button
          type="submit"
          disabled={loading}
          className="bg-blue-600 text-white rounded-xl px-4 py-2 hover:opacity-90"
        >
          {loading ? "Submitting..." : "Submit"}
        </button>
      </form>
    </div>
  );
}
