import { useEffect, useState } from "react";
import { authFetch } from "../../utils/api";
import { toast } from "react-hot-toast";

const STATUS = ["OPEN", "IN_PROGRESS", "RESOLVED", "REJECTED"];

export default function ManageProblems() {
  const [query, setQuery] = useState({
    search: "",
    status: "",
    department: "",
    page: 1,
  });
  const [data, setData] = useState({
    problems: [],
    page: 1,
    pages: 1,
    total: 0,
  });
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (query.search) params.set("search", query.search);
      if (query.status) params.set("status", query.status);
      if (query.department) params.set("department", query.department);
      params.set("page", String(query.page));
      params.set("limit", "10");
      const res = await authFetch(`/problems?${params.toString()}`);
      setData(res);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [query.page]); // fetch again when page changes

  const handleSearch = (e) => {
    e.preventDefault();
    setQuery((q) => ({ ...q, page: 1 }));
    fetchData();
  };

  const updateStatus = async (id, status) => {
    try {
      await authFetch(`/problems/${id}/status`, {
        method: "PATCH",
        body: JSON.stringify({ status }),
      });
      toast.success("Status updated");
      fetchData();
    } catch (err) {
      toast.error(err.message);
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-semibold mb-4">Manage Problems</h1>

      <form
        onSubmit={handleSearch}
        className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-4"
      >
        <input
          placeholder="Search title/description"
          className="border rounded-xl p-3"
          value={query.search}
          onChange={(e) => setQuery({ ...query, search: e.target.value })}
        />
        <select
          className="border rounded-xl p-3"
          value={query.status}
          onChange={(e) => setQuery({ ...query, status: e.target.value })}
        >
          <option value="">All Status</option>
          {STATUS.map((s) => (
            <option key={s} value={s}>
              {s}
            </option>
          ))}
        </select>
        <input
          placeholder="Department filter (optional)"
          className="border rounded-xl p-3"
          value={query.department}
          onChange={(e) => setQuery({ ...query, department: e.target.value })}
        />
        <button className="bg-blue-600 text-white rounded-xl px-4 py-2 hover:opacity-90">
          Filter
        </button>
      </form>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <div className="grid gap-3">
          {data.problems.map((p) => (
            <div key={p._id} className="border rounded-2xl p-4">
              <div className="flex flex-wrap justify-between gap-2">
                <div>
                  <h2 className="font-semibold">{p.title}</h2>
                  <p className="text-sm text-gray-600">
                    {p.category} • {p.department} • by {p.submittedBy?.name} (
                    {p.submittedBy?.role})
                  </p>
                </div>
                <div className="flex gap-2">
                  <select
                    value={p.status}
                    onChange={(e) => updateStatus(p._id, e.target.value)}
                    className="border rounded-xl p-2"
                  >
                    {STATUS.map((s) => (
                      <option key={s} value={s}>
                        {s}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <p className="mt-2 text-gray-800 whitespace-pre-wrap">
                {p.description}
              </p>
              {p.comments?.length ? (
                <div className="mt-2 bg-gray-50 rounded-xl p-2">
                  {p.comments.map((c, idx) => (
                    <div key={idx} className="text-sm text-gray-700">
                      <span className="font-medium">{c.by?.name}</span>:{" "}
                      {c.text}
                    </div>
                  ))}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="flex items-center gap-3 mt-4">
        <button
          disabled={query.page <= 1}
          onClick={() => setQuery((q) => ({ ...q, page: q.page - 1 }))}
          className="border rounded-xl px-3 py-1 disabled:opacity-50"
        >
          Prev
        </button>
        <span className="text-sm">
          Page {data.page} / {data.pages} • {data.total} results
        </span>
        <button
          disabled={data.page >= data.pages}
          onClick={() => setQuery((q) => ({ ...q, page: q.page + 1 }))}
          className="border rounded-xl px-3 py-1 disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
}
