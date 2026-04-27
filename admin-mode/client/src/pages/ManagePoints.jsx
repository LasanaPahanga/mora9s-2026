import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function ManagePoints() {
  const { token } = useContext(AuthContext);
  const [rows, setRows] = useState([]);
  const [teams, setTeams] = useState([]);
  const [form, setForm] = useState({
    team_id: "",
    played: "0",
    won: "0",
    drawn: "0",
    lost: "0",
    points: "0"
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchPoints = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/points`, authConfig);
      setRows(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load points");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/teams`, authConfig);
      setTeams(res.data || []);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPoints();
      fetchTeams();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
  };

  const validateForm = () => {
    const errs = {};
    if (!form.team_id) errs.team_id = "Required";

    const checkNonNegativeInt = (field) => {
      const v = form[field];
      if (v === "" || v === null || v === undefined) return;
      if (!/^\d+$/.test(String(v))) errs[field] = "Must be a non-negative integer";
    };

    ["played", "won", "drawn", "lost", "points"].forEach(checkNonNegativeInt);
    return errs;
  };

  const resetForm = () => {
    setForm({
      team_id: "",
      played: "0",
      won: "0",
      drawn: "0",
      lost: "0",
      points: "0"
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
      team_id: Number(form.team_id),
      played: Number(form.played || 0),
      won: Number(form.won || 0),
      drawn: Number(form.drawn || 0),
      lost: Number(form.lost || 0),
      points: Number(form.points || 0)
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/admin/points/${editingId}`,
          payload,
          authConfig
        );
      } else {
        await axios.post(`${API_BASE}/admin/points`, payload, authConfig);
      }
      resetForm();
      fetchPoints();
    } catch (err) {
      console.error(err);
      setError("Failed to save points row");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      team_id: row.team_id ?? "",
      played: String(row.played ?? 0),
      won: String(row.won ?? 0),
      drawn: String(row.drawn ?? 0),
      lost: String(row.lost ?? 0),
      points: String(row.points ?? 0)
    });
    setFieldErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this points row?")) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/admin/points/${id}`, authConfig);
      fetchPoints();
    } catch (err) {
      console.error(err);
      setError("Failed to delete points row");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Points</h1>
        <p className="text-slate-300 mb-2">
          Maintain the league table for each team. Use the team ID from the
          teams table.
        </p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-lg p-4 grid gap-3 md:grid-cols-3 lg:grid-cols-6 items-end"
      >
        <div>
          <label className="block text-sm text-slate-300 mb-1">Team</label>
          <select
            name="team_id"
            value={form.team_id}
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
          {fieldErrors.team_id && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.team_id}</p>
          )}
        </div>

        {[
          ["played", "Played"],
          ["won", "Won"],
          ["drawn", "Drawn"],
          ["lost", "Lost"],
          ["points", "Points"]
        ].map(([field, label]) => (
          <div key={field}>
            <label className="block text-sm text-slate-300 mb-1">{label}</label>
            <input
              type="number"
              min="0"
              name={field}
              value={form[field]}
              onChange={handleChange}
              className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
            />
            {fieldErrors[field] && (
              <p className="text-xs text-red-400 mt-1">
                {fieldErrors[field]}
              </p>
            )}
          </div>
        ))}

        <div className="flex gap-2 items-end">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded text-white font-medium"
          >
            {editingId ? "Update" : "Add"} row
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
          <h2 className="font-semibold text-lg">Current table</h2>
          {loading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <table className="min-w-full text-sm border border-slate-700">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Team ID</th>
              <th className="px-3 py-2 text-center">P</th>
              <th className="px-3 py-2 text-center">W</th>
              <th className="px-3 py-2 text-center">D</th>
              <th className="px-3 py-2 text-center">L</th>
              <th className="px-3 py-2 text-center">Pts</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => (
              <tr key={row.id} className="border-t border-slate-700">
                <td className="px-3 py-2">{row.id}</td>
                <td className="px-3 py-2">{row.team_id}</td>
                <td className="px-3 py-2 text-center">{row.played}</td>
                <td className="px-3 py-2 text-center">{row.won}</td>
                <td className="px-3 py-2 text-center">{row.drawn}</td>
                <td className="px-3 py-2 text-center">{row.lost}</td>
                <td className="px-3 py-2 text-center font-semibold">
                  {row.points}
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(row)}
                    className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(row.id)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {rows.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={8}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No points data yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default ManagePoints;
