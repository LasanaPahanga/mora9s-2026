import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";
import AdminTableScroll from "../components/AdminTableScroll.jsx";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

/** Human-readable outcome for the results table (API still stores team_1_win / team_2_win / draw). */
function formatResultDisplay(row) {
  const raw = row?.result;
  if (raw == null || raw === "") return "—";
  const t1 = row.team_1_name?.trim() || "Team 1";
  const t2 = row.team_2_name?.trim() || "Team 2";
  const s1 = Number(row.team_1_score ?? 0);
  const s2 = Number(row.team_2_score ?? 0);
  const pens =
    row.penalty_score_team_1 != null &&
    row.penalty_score_team_2 != null &&
    s1 === s2;
  const suffix = pens ? " (penalties)" : "";

  if (raw === "team_1_win") return `${t1} wins${suffix}`;
  if (raw === "team_2_win") return `${t2} wins${suffix}`;
  if (raw === "draw") return "Draw";
  return String(raw);
}

function ManageResults() {
  const { token } = useContext(AuthContext);
  const [results, setResults] = useState([]);
  const [matches, setMatches] = useState([]);
  const [form, setForm] = useState({
    match_id: "",
    team_1_score: "0",
    team_2_score: "0",
    yellow_cards_team_1: "0",
    red_cards_team_1: "0",
    green_cards_team_1: "0",
    yellow_cards_team_2: "0",
    red_cards_team_2: "0",
    green_cards_team_2: "0",
    penalty_score_team_1: "",
    penalty_score_team_2: ""
  });
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState({});
  const [selectedMatch, setSelectedMatch] = useState(null);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchResults = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/results`, authConfig);
      setResults(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load results");
    } finally {
      setLoading(false);
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
      fetchResults();
      fetchMatches();
    }
  }, [token]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => {
      const newForm = { ...prev, [name]: value };
      
      // Clear penalty scores if regular scores are no longer equal
      if (name === "team_1_score" || name === "team_2_score") {
        const score1 = name === "team_1_score" ? value : prev.team_1_score;
        const score2 = name === "team_2_score" ? value : prev.team_2_score;
        
        // If scores are not equal, clear penalty scores
        if (score1 !== score2) {
          newForm.penalty_score_team_1 = "";
          newForm.penalty_score_team_2 = "";
        }
      }
      
      return newForm;
    });
    setFieldErrors((prev) => ({ ...prev, [name]: "" }));
    
    // If match_id changes, find the match and check if penalties are needed
    if (name === "match_id") {
      const match = matches.find(m => m.id === Number(value));
      setSelectedMatch(match);
    }
    
    // Also update selectedMatch if scores change (for existing results being edited)
    if ((name === "team_1_score" || name === "team_2_score") && form.match_id && !selectedMatch) {
      const match = matches.find(m => m.id === Number(form.match_id));
      setSelectedMatch(match);
    }
  };

  const validateForm = () => {
    const errs = {};
    if (!form.match_id) errs.match_id = "Required";

    const checkNonNegativeInt = (field) => {
      const v = form[field];
      if (v === "" || v === null || v === undefined) return;
      if (!/^\d+$/.test(String(v))) errs[field] = "Must be a non-negative integer";
    };

    ["team_1_score", "team_2_score"].forEach(checkNonNegativeInt);
    return errs;
  };

  const resetForm = () => {
    setForm({
      match_id: "",
      team_1_score: "0",
      team_2_score: "0",
      yellow_cards_team_1: "0",
      red_cards_team_1: "0",
      green_cards_team_1: "0",
      yellow_cards_team_2: "0",
      red_cards_team_2: "0",
      green_cards_team_2: "0",
      penalty_score_team_1: "",
      penalty_score_team_2: ""
    });
    setEditingId(null);
    setFieldErrors({});
    setSelectedMatch(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    const errs = validateForm();
    if (Object.keys(errs).length) {
      setFieldErrors(errs);
      return;
    }

    // Helper function to parse penalty scores - converts to number if valid, otherwise null
    const parsePenaltyScore = (value) => {
      if (value === "" || value === null || value === undefined) return null;
      const num = Number(value);
      return isNaN(num) ? null : num;
    };

    const payload = {
      match_id: Number(form.match_id),
      team_1_score: Number(form.team_1_score || 0),
      team_2_score: Number(form.team_2_score || 0),
      yellow_cards_team_1: Number(form.yellow_cards_team_1 || 0),
      red_cards_team_1: Number(form.red_cards_team_1 || 0),
      green_cards_team_1: Number(form.green_cards_team_1 || 0),
      yellow_cards_team_2: Number(form.yellow_cards_team_2 || 0),
      red_cards_team_2: Number(form.red_cards_team_2 || 0),
      green_cards_team_2: Number(form.green_cards_team_2 || 0),
      penalty_score_team_1: parsePenaltyScore(form.penalty_score_team_1),
      penalty_score_team_2: parsePenaltyScore(form.penalty_score_team_2)
    };
    
    console.log('Form state:', form);
    console.log('Submitting payload:', payload);

    try {
      if (editingId) {
        await axios.put(
          `${API_BASE}/admin/results/${editingId}`,
          payload,
          authConfig
        );
      } else {
        await axios.post(`${API_BASE}/admin/results`, payload, authConfig);
      }
      resetForm();
      fetchResults();
    } catch (err) {
      console.error(err);
      setError("Failed to save result");
    }
  };

  const handleEdit = (row) => {
    setEditingId(row.id);
    setForm({
      match_id: row.match_id ?? "",
      team_1_score: String(row.team_1_score ?? 0),
      team_2_score: String(row.team_2_score ?? 0),
      yellow_cards_team_1: String(row.yellow_cards_team_1 ?? 0),
      red_cards_team_1: String(row.red_cards_team_1 ?? 0),
      green_cards_team_1: String(row.green_cards_team_1 ?? 0),
      yellow_cards_team_2: String(row.yellow_cards_team_2 ?? 0),
      red_cards_team_2: String(row.red_cards_team_2 ?? 0),
      green_cards_team_2: String(row.green_cards_team_2 ?? 0),
      penalty_score_team_1: row.penalty_score_team_1 != null ? String(row.penalty_score_team_1) : "",
      penalty_score_team_2: row.penalty_score_team_2 != null ? String(row.penalty_score_team_2) : ""
    });
    const match = matches.find(m => m.id === row.match_id);
    setSelectedMatch(match);
    setFieldErrors({});
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this result?")) return;
    setError("");
    try {
      await axios.delete(`${API_BASE}/admin/results/${id}`, authConfig);
      fetchResults();
    } catch (err) {
      console.error(err);
      setError("Failed to delete result");
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Manage Results</h1>
        <p className="text-slate-300 mb-2">
          Record final scores for each match. Result (win/draw) is calculated automatically.
        </p>
        {error && <p className="text-red-400 text-sm mb-2">{error}</p>}
      </div>

      <form
        onSubmit={handleSubmit}
        className="bg-slate-800 rounded-lg p-4 space-y-4"
      >
        <div className="grid gap-3 md:grid-cols-3">
        <div>
          <label className="block text-sm text-slate-300 mb-1">Match ID</label>
          <input
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
          <label className="block text-sm text-slate-300 mb-1">
            Team 1 Score
          </label>
          <input
            type="number"
            min="0"
            name="team_1_score"
            value={form.team_1_score}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
          {fieldErrors.team_1_score && (
            <p className="text-xs text-red-400 mt-1">
              {fieldErrors.team_1_score}
            </p>
          )}
        </div>

        <div>
          <label className="block text-sm text-slate-300 mb-1">
            Team 2 Score
          </label>
          <input
            type="number"
            min="0"
            name="team_2_score"
            value={form.team_2_score}
            onChange={handleChange}
            className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
          />
          {fieldErrors.team_2_score && (
            <p className="text-xs text-red-400 mt-1">
              {fieldErrors.team_2_score}
            </p>
          )}
        </div>
        </div>

        {/* Team 1 Cards */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Team 1 Cards</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">🟨 Yellow Cards</label>
              <input
                type="number"
                min="0"
                name="yellow_cards_team_1"
                value={form.yellow_cards_team_1}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">🟥 Red Cards</label>
              <input
                type="number"
                min="0"
                name="red_cards_team_1"
                value={form.red_cards_team_1}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">🟩 Green Cards</label>
              <input
                type="number"
                min="0"
                name="green_cards_team_1"
                value={form.green_cards_team_1}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Team 2 Cards */}
        <div>
          <h3 className="text-sm font-semibold text-slate-300 mb-2">Team 2 Cards</h3>
          <div className="grid gap-3 md:grid-cols-3">
            <div>
              <label className="block text-sm text-slate-300 mb-1">🟨 Yellow Cards</label>
              <input
                type="number"
                min="0"
                name="yellow_cards_team_2"
                value={form.yellow_cards_team_2}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">🟥 Red Cards</label>
              <input
                type="number"
                min="0"
                name="red_cards_team_2"
                value={form.red_cards_team_2}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-300 mb-1">🟩 Green Cards</label>
              <input
                type="number"
                min="0"
                name="green_cards_team_2"
                value={form.green_cards_team_2}
                onChange={handleChange}
                className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700"
              />
            </div>
          </div>
        </div>

        {/* Penalty Scores - Only show if match is Semi Final, 3rd Place, or Final AND scores are equal */}
        {selectedMatch && (selectedMatch.match_type === 'semi_final' || selectedMatch.match_type === '3rd_place' || selectedMatch.match_type === 'final') && 
         form.team_1_score === form.team_2_score && form.team_1_score !== "" && (
          <div className="bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4">
            <h3 className="text-lg font-semibold text-yellow-400 mb-3 flex items-center gap-2">
              ⚽ Penalty Shootout Scores
              <span className="text-xs text-slate-400 font-normal">(Required for Semi Final/3rd Place/Final draws)</span>
            </h3>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-semibold">Team 1 Penalty Score</label>
                <input
                  type="number"
                  min="0"
                  name="penalty_score_team_1"
                  value={form.penalty_score_team_1}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded bg-slate-900 text-white border-2 border-yellow-500/30 focus:border-yellow-500 text-lg font-bold"
                  placeholder="0"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-300 mb-2 font-semibold">Team 2 Penalty Score</label>
                <input
                  type="number"
                  min="0"
                  name="penalty_score_team_2"
                  value={form.penalty_score_team_2}
                  onChange={handleChange}
                  className="w-full px-4 py-3 rounded bg-slate-900 text-white border-2 border-yellow-500/30 focus:border-yellow-500 text-lg font-bold"
                  placeholder="0"
                />
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-2">
          <button
            type="submit"
            className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded text-white font-medium"
          >
            {editingId ? "Update" : "Add"} result
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
          <h2 className="font-semibold text-lg">Recorded results</h2>
          {loading && <span className="text-xs text-slate-400">Loading…</span>}
        </div>
        <AdminTableScroll>
        <table className="w-full min-w-[64rem] text-sm border border-slate-700">
          <thead className="bg-slate-900 text-slate-300">
            <tr>
              <th className="px-3 py-2 text-left">ID</th>
              <th className="px-3 py-2 text-left">Match ID</th>
              <th className="px-3 py-2 text-left">Team 1</th>
              <th className="px-3 py-2 text-center">T1 Cards</th>
              <th className="px-3 py-2 text-left">Team 2</th>
              <th className="px-3 py-2 text-center">T2 Cards</th>
              <th className="px-3 py-2 text-center">Category</th>
              <th className="px-3 py-2 text-center">Match Type</th>
              <th className="px-3 py-2 text-left">Result</th>
              <th className="px-3 py-2 text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {results.map((row) => (
              <tr key={row.id} className="border-t border-slate-700">
                <td className="px-3 py-2">{row.id}</td>
                <td className="px-3 py-2">{row.match_id}</td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{row.team_1_name || 'Team 1'}</span>
                    <span className="font-bold text-lg ml-2">{row.team_1_score}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-xs">
                  <span className="text-yellow-400">🟨{row.yellow_cards_team_1 || 0}</span>
                  {' '}
                  <span className="text-red-400">🟥{row.red_cards_team_1 || 0}</span>
                  {' '}
                  <span className="text-green-400">🟩{row.green_cards_team_1 || 0}</span>
                </td>
                <td className="px-3 py-2">
                  <div className="flex items-center justify-between">
                    <span className="font-medium">{row.team_2_name || 'Team 2'}</span>
                    <span className="font-bold text-lg ml-2">{row.team_2_score}</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-center text-xs">
                  <span className="text-yellow-400">🟨{row.yellow_cards_team_2 || 0}</span>
                  {' '}
                  <span className="text-red-400">🟥{row.red_cards_team_2 || 0}</span>
                  {' '}
                  <span className="text-green-400">🟩{row.green_cards_team_2 || 0}</span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    row.category === 'women' ? 'bg-pink-900 text-pink-300' : 'bg-blue-900 text-blue-300'
                  }`}>
                    {row.category === 'women' ? 'Women' : 'Men'}
                  </span>
                </td>
                <td className="px-3 py-2 text-center">
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    row.match_type === 'group_stage' ? 'bg-blue-500 text-white' :
                    row.match_type === 'super6' ? 'bg-cyan-500 text-white' :
                    row.match_type === 'semi_final' ? 'bg-orange-500 text-white' :
                    row.match_type === '3rd_place' ? 'bg-yellow-500 text-white' :
                    row.match_type === 'final' ? 'bg-red-500 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {row.match_type === 'group_stage' ? 'Group Stage' :
                     row.match_type === 'super6' ? 'Super 6' :
                     row.match_type === 'semi_final' ? 'Semi Final' :
                     row.match_type === '3rd_place' ? '3rd Place' :
                     row.match_type === 'final' ? 'Final' : row.match_type}
                  </span>
                </td>
                <td className="px-3 py-2 whitespace-nowrap">{formatResultDisplay(row)}</td>
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
            {results.length === 0 && !loading && (
              <tr>
                <td
                  colSpan={10}
                  className="px-3 py-4 text-center text-slate-400"
                >
                  No results recorded yet.
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

export default ManageResults;
