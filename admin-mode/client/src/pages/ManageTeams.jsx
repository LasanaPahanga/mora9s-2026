import { useContext, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import AdminTableScroll from "../components/AdminTableScroll.jsx";
import { FILTER_ALL, rowMatchesCategory } from "../utils/adminListFilters.js";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function ManageTeams() {
  const { token } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [groups, setGroups] = useState([]);
  const [form, setForm] = useState({ name: "", group_id: "", category: "men" });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState(FILTER_ALL);

  const filteredTeams = useMemo(
    () => teams.filter((t) => rowMatchesCategory(t.category, categoryFilter)),
    [teams, categoryFilter]
  );

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchTeams = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/teams`, authConfig);
      setTeams(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load teams");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroups = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/groups`, authConfig);
      setGroups(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchTeams();
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
          `${API_BASE}/admin/teams/${editingId}`,
          { ...form, group_id: form.group_id || null },
          authConfig
        );
      } else {
        await axios.post(
          `${API_BASE}/admin/teams`,
          { ...form, group_id: form.group_id || null },
          authConfig
        );
      }
      setForm({ name: "", group_id: "", category: "men" });
      setEditingId(null);
      fetchTeams();
    } catch (err) {
      console.error(err);
      setError("Failed to save team");
    }
  };

  const handleEdit = (team) => {
    setEditingId(team.id);
    setForm({ name: team.name || "", group_id: team.group_id || "", category: team.category || "men" });
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this team?")) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/admin/teams/${id}`, authConfig);
      fetchTeams();
    } catch (err) {
      console.error(err);
      setError("Failed to delete team");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Teams</h1>
        <p className="text-slate-300 mb-2">
          Create, update, and delete teams. Group is optional.
        </p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-lg p-4 grid gap-3 md:grid-cols-[1fr,150px,150px,auto] items-end"
      >
        <div>
          <label className="block text-sm text-slate-300 mb-1">Team name</label>
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1">Group</label>
          <select
            name="group_id"
            value={form.group_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          >
            <option value="">No Group</option>
            {groups.map((g) => (
              <option key={g.id} value={g.id}>
                {g.name}
              </option>
            ))}
          </select>
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
          {editingId ? "Update" : "Add"} team
        </button>
      </form>

      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Existing teams</h2>
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
              <th className="px-3 py-2 text-left">Group</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredTeams.map((team) => (
              <tr key={team.id} className="border-t border-slate-700">
                <td className="px-3 py-2">{team.id}</td>
                <td className="px-3 py-2">{team.name}</td>
                <td className="px-3 py-2">
                  {team.group_id ? (
                    groups.find(g => g.id === team.group_id)?.name || `Group ${team.group_id}`
                  ) : (
                    <span className="text-slate-500">No Group</span>
                  )}
                </td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    team.category === 'women' ? 'bg-pink-900 text-pink-300' : 'bg-blue-900 text-blue-300'
                  }`}>
                    {team.category === 'women' ? 'Women' : 'Men'}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(team)}
                    className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(team.id)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {filteredTeams.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={5}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  {teams.length === 0 ? "No teams yet." : "No teams match this filter."}
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

export default ManageTeams;
