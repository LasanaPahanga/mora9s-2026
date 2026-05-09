import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import AdminTableScroll from "../components/AdminTableScroll.jsx";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function ManageMatches() {
  const { token } = useContext(AuthContext);
  const [matches, setMatches] = useState([]);
  const [groups, setGroups] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    group_id: "",
    team_1_id: "",
    team_2_id: "",
    status: "scheduled",
    category: "men",
    match_type: "group_stage"
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchMatches = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/matches`, authConfig);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load matches");
    } finally {
      setLoading(false);
    }
  };

  const fetchGroupsAndTeams = async () => {
    try {
      const [groupsRes, teamsRes] = await Promise.all([
        axios.get(`${API_BASE}/admin/groups`, authConfig),
        axios.get(`${API_BASE}/admin/teams`, authConfig)
      ]);
      setGroups(groupsRes.data || []);
      setTeams(teamsRes.data || []);
    } catch (err) {
      console.error(err);
      // Do not set global error here to avoid overriding matches errors.
    }
  };

  useEffect(() => {
    if (token) {
      fetchMatches();
      fetchGroupsAndTeams();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errs = {};
    // Group is required for Group Stage and Super 6 matches
    if (!form.group_id && (form.match_type === 'group_stage' || form.match_type === 'super6')) {
      errs.group_id = "Required for Group Stage matches";
    }
    if (!form.team_1_id) errs.team_1_id = "Required";
    if (!form.team_2_id) errs.team_2_id = "Required";
    if (form.team_1_id && form.team_2_id && form.team_1_id === form.team_2_id) {
      errs.team_2_id = "Team 1 and Team 2 cannot be the same";
    }
    return errs;
  };

  const resetForm = () => {
    setForm({
      group_id: "",
      team_1_id: "",
      team_2_id: "",
      status: "scheduled",
      category: "men",
      match_type: "group_stage"
    });
    setEditingId(null);
    setFieldErrors({});
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    const payload = {
      group_id: form.group_id ? Number(form.group_id) : null,
      team_1_id: form.team_1_id ? Number(form.team_1_id) : null,
      team_2_id: form.team_2_id ? Number(form.team_2_id) : null,
      status: form.status || "scheduled",
      category: form.category || "men",
      match_type: form.match_type || "group_stage"
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/admin/matches/${editingId}`,
          payload,
          authConfig
        );
      } else {
        await axios.post(`${API_BASE}/admin/matches`, payload, authConfig);
      }
      resetForm();
      fetchMatches();
    } catch (err) {
      console.error(err);
      setError("Failed to save match");
    }
  };

  const handleEdit = (match) => {
    setEditingId(match.id);
    setForm({
      group_id: match.group_id ?? "",
      team_1_id: match.team_1_id ?? "",
      team_2_id: match.team_2_id ?? "",
      status: match.status || "scheduled",
      category: match.category || "men",
      match_type: match.match_type || "group_stage"
    });
    setFieldErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this match?")) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/admin/matches/${id}`, authConfig);
      fetchMatches();
    } catch (err) {
      console.error(err);
      setError("Failed to delete match");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Matches</h1>
        <p className="text-slate-300 mb-2">
          Create, update, and delete tournament matches. Use team and group IDs
          as stored in the database.
        </p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-lg p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3 items-end"
      >
        {/* Group field - only show for Group Stage matches */}
        {form.match_type === 'group_stage' && (
          <div>
            <label className="block text-sm text-slate-300 mb-1">
              Group <span className="text-red-400">*</span>
            </label>
            <select
              name="group_id"
              value={form.group_id}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
            >
              <option value="">Select group</option>
              {groups.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.name || `Group ${g.id}`}
                </option>
              ))}
            </select>
            {fieldErrors.group_id && (
              <p className="text-xs text-red-400 mt-1">{fieldErrors.group_id}</p>
            )}
          </div>
        )}
        
        {/* Info message for Semi Final/3rd Place/Final */}
        {(form.match_type === 'semi_final' || form.match_type === '3rd_place' || form.match_type === 'final') && (
          <div className="col-span-full">
            <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-3 text-sm text-blue-300">
              ℹ️ Group not required for {
                form.match_type === 'semi_final' ? 'Semi Final' : 
                form.match_type === '3rd_place' ? '3rd Place' : 
                'Final'
              } matches
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Team 1
          </label>
          <select
            name="team_1_id"
            value={form.team_1_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || `Team ${t.id}`}
              </option>
            ))}
          </select>
          {fieldErrors.team_1_id && (
            <p className="text-xs text-red-400 mt-1">
              {fieldErrors.team_1_id}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Team 2
          </label>
          <select
            name="team_2_id"
            value={form.team_2_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          >
            <option value="">Select team</option>
            {teams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name || `Team ${t.id}`}
              </option>
            ))}
          </select>
          {fieldErrors.team_2_id && (
            <p className="text-xs text-red-400 mt-1">
              {fieldErrors.team_2_id}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Status</label>
          <select
            name="status"
            value={form.status}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          >
            <option value="scheduled">Scheduled</option>
            <option value="finished">Finished</option>
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

        <div>
          <label className="block text-sm text-slate-300 mb-1">Match Type</label>
          <select
            name="match_type"
            value={form.match_type}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          >
            <option value="group_stage">Group Stage</option>
            <option value="super6">Super 6</option>
            <option value="semi_final">Semi Final</option>
            <option value="3rd_place">3rd Place</option>
            <option value="final">Final</option>
          </select>
        </div>

        <div className="flex gap-2 items-end md:col-span-2 lg:col-span-3">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded text-white font-medium"
          >
            {editingId ? "Update" : "Add"} match
          </button>
          {editingId && (
            <button
              type="button"
              onClick={resetForm}
              className="px-3 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm"
            >
              Cancel
            </button>
          )}
        </div>
      </form>

      <div className="bg-slate-800 rounded-lg p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-semibold text-lg">Existing matches</h2>
          {loading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <AdminTableScroll>
        <table className="w-full min-w-[48rem] text-sm border border-slate-700">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Group</th>
              <th className="px-3 py-2 text-left">Team 1</th>
              <th className="px-3 py-2 text-left">Team 2</th>
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Category</th>
              <th className="px-3 py-2 text-left">Match Type</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {matches.map((match) => (
              <tr key={match.id} className="border-t border-slate-700">
                <td className="px-3 py-2">{match.id}</td>
                <td className="px-3 py-2">{match.group_name ?? "-"}</td>
                <td className="px-3 py-2">{match.team_1_name ?? "-"}</td>
                <td className="px-3 py-2">{match.team_2_name ?? "-"}</td>
                <td className="px-3 py-2">{match.status}</td>
                <td className="px-3 py-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    match.category === 'women' ? 'bg-pink-900 text-pink-300' : 'bg-blue-900 text-blue-300'
                  }`}>
                    {match.category === 'women' ? 'Women' : 'Men'}
                  </span>
                </td>
                <td className="px-3 py-2">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    match.match_type === 'group_stage' ? 'bg-blue-500 text-white' :
                    match.match_type === 'super6' ? 'bg-cyan-500 text-white' :
                    match.match_type === 'semi_final' ? 'bg-orange-500 text-white' :
                    match.match_type === '3rd_place' ? 'bg-yellow-500 text-white' :
                    match.match_type === 'final' ? 'bg-red-500 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {match.match_type === 'group_stage' ? 'Group Stage' :
                     match.match_type === 'super6' ? 'Super 6' :
                     match.match_type === 'semi_final' ? 'Semi Final' :
                     match.match_type === '3rd_place' ? '3rd Place' :
                     match.match_type === 'final' ? 'Final' : match.match_type}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(match)}
                    className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(match.id)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {matches.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No matches yet.
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

export default ManageMatches;
