import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import AdminTableScroll from "../components/AdminTableScroll.jsx";
import { FILTER_ALL, rowMatchesCategory } from "../utils/adminListFilters.js";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function ManageGroups() {
  const { token } = useContext(AuthContext);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: "", description: "", category: "men" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(FILTER_ALL);

  const filteredGroups = useMemo(
    () => groups.filter((g) => rowMatchesCategory(g.category, categoryFilter)),
    [groups, categoryFilter]
  );

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchGroups = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/groups`, authConfig);
      setGroups(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load groups");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGroups();
    }
  }, [token]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/admin/groups/${editingId}`,
          form,
          authConfig
        );
      } else {
        await axios.post(`${API_BASE}/admin/groups`, form, authConfig);
      }
      setForm({ name: "", description: "", category: "men" });
      setEditingId(null);
      fetchGroups();
    } catch (err) {
      console.error(err);
      setError("Failed to save group");
    }
  };

  const handleEdit = (group) => {
    setEditingId(group.id);
    setForm({ name: group.name || "", description: group.description || "", category: group.category || "men" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this group?")) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/admin/groups/${id}`, authConfig);
      fetchGroups();
    } catch (err) {
      console.error(err);
      setError("Failed to delete group");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Groups</h1>
        <p className="text-slate-300 mb-2">
          Create, update, and delete groups used to organize teams.
        </p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-lg p-4 grid gap-3 md:grid-cols-[1fr,2fr,150px,auto] items-end"
      >
        <div>
          <label className="block text-sm text-slate-300 mb-1">Name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Description (optional)
          </label>
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Category</label>
          <select
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          >
            <option value="men">Men</option>
            <option value="women">Women</option>
          </select>
        </div>
        <button
          type="submit"
          className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded text-white font-medium"
        >
          {editingId ? "Update" : "Add"} group
        </button>
      </form>

      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Existing groups</h2>
          {loading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <div className="flex flex-wrap items-end gap-3 mb-3">
          <div>
            <label className="block text-xs text-slate-400 mb-1">Category filter</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="min-w-[8rem] px-3 py-2 rounded bg-slate-900 text-white border border-slate-700 text-sm"
            >
              <option value={FILTER_ALL}>All</option>
              <option value="men">Men</option>
              <option value="women">Women</option>
            </select>
          </div>
        </div>
        <AdminTableScroll>
        <table className="w-full min-w-[36rem] text-sm border border-slate-700">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Name</th>
              <th className="px-3 py-2 text-left">Description</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredGroups.map((group) => (
              <tr key={group.id} className="border-t border-slate-700">
                <td className="px-3 py-2">{group.id}</td>
                <td className="px-3 py-2">{group.name}</td>
                <td className="px-3 py-2 text-slate-300">
                  {group.description || "-"}
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    group.category === 'women' ? 'bg-pink-900 text-pink-300' : 'bg-blue-900 text-blue-300'
                  }`}>
                    {group.category === 'women' ? 'Women' : 'Men'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(group)}
                    className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(group.id)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredGroups.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  {groups.length === 0 ? "No groups yet." : "No groups match this filter."}
                </td>
              </tr>
            )}
          </tbody>
        </table>
        </AdminTableScroll>
      </div>
    </div>
  );
}

export default ManageGroups;
