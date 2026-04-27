import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function ManageCards() {
  const { token } = useContext(AuthContext);
  const [penalties, setPenalties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editValues, setEditValues] = useState({});

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` }
  };

  const fetchPenalties = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`${API_BASE}/admin/card-penalties`, authConfig);
      setPenalties(res.data);
    } catch (err) {
      console.error(err);
      setError("Failed to load card penalties");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchPenalties();
    }
  }, [token]);

  const handleEdit = (penalty) => {
    setEditingId(penalty.id);
    setEditValues({
      penalty_points: penalty.penalty_points,
      description: penalty.description || ""
    });
  };

  const handleCancel = () => {
    setEditingId(null);
    setEditValues({});
  };

  const handleSave = async (id) => {
    setError("");
    try {
      await axios.put(
        `${API_BASE}/admin/card-penalties/${id}`,
        editValues,
        authConfig
      );
      setEditingId(null);
      setEditValues({});
      fetchPenalties();
    } catch (err) {
      console.error(err);
      setError("Failed to update card penalty");
    }
  };

  const getCardColor = (cardType) => {
    if (cardType === 'yellow') return 'bg-yellow-500';
    if (cardType === 'red') return 'bg-red-500';
    if (cardType === 'green') return 'bg-green-500';
    return 'bg-slate-500';
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold mb-2">Card Penalty Configuration</h1>
        <p className="text-slate-300 mb-2">
          Set penalty points for yellow, red, and green cards. These are used to break ties in the points table.
        </p>
        <p className="text-xs text-slate-400">
          Negative values will deduct points. For example, -1 for yellow card means each yellow card subtracts 1 point.
        </p>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}
      </div>

      <div className="bg-slate-800 rounded-lg p-6">
        <h2 className="font-semibold text-lg mb-4">Card Penalties</h2>
        {loading ? (
          <div className="text-center text-slate-400 py-8">Loading...</div>
        ) : (
          <div className="space-y-4">
            {penalties.map((penalty) => (
              <div
                key={penalty.id}
                className="bg-slate-900 rounded-lg p-4 border border-slate-700"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 ${getCardColor(penalty.card_type)} rounded-lg flex items-center justify-center text-2xl shadow-lg`}>
                      {penalty.card_type === 'yellow' ? '🟨' : penalty.card_type === 'red' ? '🟥' : '🟩'}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold capitalize">{penalty.card_type} Card</h3>
                      <p className="text-xs text-slate-400">
                        {editingId === penalty.id ? 'Editing...' : penalty.description}
                      </p>
                    </div>
                  </div>
                  {editingId === penalty.id ? (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleSave(penalty.id)}
                        className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 rounded text-white text-sm font-medium"
                      >
                        Save
                      </button>
                      <button
                        onClick={handleCancel}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm"
                      >
                        Cancel
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => handleEdit(penalty)}
                      className="px-4 py-2 bg-slate-700 hover:bg-slate-600 rounded text-white text-sm"
                    >
                      Edit
                    </button>
                  )}
                </div>

                {editingId === penalty.id ? (
                  <div className="grid gap-4 md:grid-cols-2 mt-4">
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Penalty Points
                      </label>
                      <input
                        type="number"
                        value={editValues.penalty_points}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            penalty_points: Number(e.target.value)
                          })
                        }
                        className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
                      />
                      <p className="text-xs text-slate-400 mt-1">
                        Use negative values to deduct points
                      </p>
                    </div>
                    <div>
                      <label className="block text-sm text-slate-300 mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={editValues.description}
                        onChange={(e) =>
                          setEditValues({
                            ...editValues,
                            description: e.target.value
                          })
                        }
                        className="w-full px-3 py-2 rounded bg-slate-800 text-white border border-slate-700"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="bg-slate-800 rounded p-3 mt-4">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 text-sm">Current Penalty:</span>
                      <span className={`text-2xl font-bold ${penalty.penalty_points < 0 ? 'text-red-400' : 'text-emerald-400'}`}>
                        {penalty.penalty_points > 0 ? '+' : ''}{penalty.penalty_points} points
                      </span>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ManageCards;
