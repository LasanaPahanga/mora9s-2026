import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import AdminTableScroll from "../components/AdminTableScroll.jsx";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function ManageGoalScorers() {
  const { token } = useContext(AuthContext);
  const [goalScorers, setGoalScorers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [filteredTeams, setFilteredTeams] = useState([]);
  const [form, setForm] = useState({
    match_id: "",
    player_name: "",
    team_id: "",
    goals_scored: "1"
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchGoalScorers = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/goal-scorers`, authConfig);
      setGoalScorers(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load goal scorers");
    } finally {
      setLoading(false);
    }
  };

  const fetchTeams = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/teams`, authConfig);
      setTeams(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const fetchMatches = async () => {
    try {
      const res = await axios.get(`${API_BASE}/admin/matches`, authConfig);
      setMatches(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchGoalScorers();
      fetchTeams();
      fetchMatches();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
    
    // When match_id changes, filter teams to only show the two teams in that match
    if (name === "match_id" && value) {
      const selectedMatch = matches.find(m => m.id === Number(value));
      if (selectedMatch) {
        const matchTeams = teams.filter(t => 
          t.id === selectedMatch.team_1_id || t.id === selectedMatch.team_2_id
        );
        setFilteredTeams(matchTeams);
        // Reset team_id if it's not one of the match teams
        if (form.team_id && !matchTeams.find(t => t.id === Number(form.team_id))) {
          setForm(prev => ({ ...prev, team_id: "" }));
        }
      } else {
        setFilteredTeams([]);
      }
    } else if (name === "match_id" && !value) {
      setFilteredTeams([]);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.match_id) errs.match_id = "Required";
    if (!form.player_name.trim()) errs.player_name = "Required";
    if (!form.team_id) errs.team_id = "Required";
    if (!form.goals_scored || form.goals_scored < 1) errs.goals_scored = "Must be at least 1";
    return errs;
  };

  const resetForm = () => {
    setForm({
      match_id: "",
      player_name: "",
      team_id: "",
      goals_scored: "1"
    });
    setEditingId(null);
    setFieldErrors({});
    setFilteredTeams([]);
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
      match_id: Number(form.match_id),
      player_name: form.player_name.trim(),
      team_id: Number(form.team_id),
      goals_scored: Number(form.goals_scored)
    };

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/admin/goal-scorers/${editingId}`,
          payload,
          authConfig
        );
      } else {
        await axios.post(`${API_BASE}/admin/goal-scorers`, payload, authConfig);
      }
      resetForm();
      fetchGoalScorers();
    } catch (err) {
      console.error(err);
      setError("Failed to save goal scorer");
    }
  };

  const handleEdit = (scorer) => {
    setEditingId(scorer.id);
    setForm({
      match_id: String(scorer.match_id) || "",
      player_name: scorer.player_name || "",
      team_id: String(scorer.team_id) || "",
      goals_scored: String(scorer.goals_scored) || "1"
    });
    
    // Filter teams for the match being edited
    if (scorer.match_id) {
      const selectedMatch = matches.find(m => m.id === scorer.match_id);
      if (selectedMatch) {
        const matchTeams = teams.filter(t => 
          t.id === selectedMatch.team_1_id || t.id === selectedMatch.team_2_id
        );
        setFilteredTeams(matchTeams);
      }
    }
    
    setFieldErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this goal scorer record?")) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/admin/goal-scorers/${id}`, authConfig);
      fetchGoalScorers();
    } catch (err) {
      console.error(err);
      setError("Failed to delete goal scorer");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Goal Scorers</h1>
        <p className="text-slate-300 mb-2">
          Record player goals for each match to track top scorers.
        </p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-lg p-4 grid gap-3 md:grid-cols-2 lg:grid-cols-4 items-end"
      >
        <div>
          <label className="block text-sm text-slate-300 mb-1">Match ID</label>
          <input
            type="number"
            name="match_id"
            value={form.match_id}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
          {fieldErrors.match_id && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.match_id}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Player Name</label>
          <input
            type="text"
            name="player_name"
            value={form.player_name}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
          {fieldErrors.player_name && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.player_name}</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Team</label>
          <select
            name="team_id"
            value={form.team_id}
            onChange={handleChange}
            disabled={!form.match_id}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <option value="">
              {!form.match_id ? "Select match first" : "Select team"}
            </option>
            {filteredTeams.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          {fieldErrors.team_id && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.team_id}</p>
          )}
          {form.match_id && filteredTeams.length === 0 && (
            <p className="text-xs text-yellow-400 mt-1">Loading teams for this match...</p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">Goals</label>
          <input
            type="number"
            min="1"
            name="goals_scored"
            value={form.goals_scored}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
          {fieldErrors.goals_scored && (
            <p className="text-xs text-red-400 mt-1">{fieldErrors.goals_scored}</p>
          )}
        </div>

        <div className="flex gap-2 items-end lg:col-span-4">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded text-white font-medium"
          >
            {editingId ? "Update" : "Add"} Goal Scorer
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
          <h2 className="font-semibold text-lg">Goal Scorers</h2>
          {loading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <AdminTableScroll>
        <table className="w-full min-w-[40rem] text-sm border border-slate-700">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Match ID</th>
              <th className="px-3 py-2 text-left">Player</th>
              <th className="px-3 py-2 text-left">Team</th>
              <th className="px-3 py-2 text-center">Goals</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {goalScorers.map((scorer) => (
              <tr key={scorer.id} className="border-t border-slate-700">
                <td className="px-3 py-2">{scorer.id}</td>
                <td className="px-3 py-2">{scorer.match_id}</td>
                <td className="px-3 py-2">{scorer.player_name}</td>
                <td className="px-3 py-2">
                  {teams.find(t => t.id === scorer.team_id)?.name || scorer.team_id}
                </td>
                <td className="px-3 py-2 text-center">
                  <span className="bg-emerald-900 text-emerald-300 px-2 py-1 rounded-full text-xs font-bold">
                    {scorer.goals_scored}
                  </span>
                </td>
                <td className="px-3 py-2 text-right space-x-2">
                  <button
                    type="button"
                    onClick={() => handleEdit(scorer)}
                    className="px-2 py-1 text-xs rounded bg-slate-700 hover:bg-slate-600"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(scorer.id)}
                    className="px-2 py-1 text-xs rounded bg-red-600 hover:bg-red-500"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {goalScorers.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={6}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No goal scorers recorded yet.
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

export default ManageGoalScorers;
