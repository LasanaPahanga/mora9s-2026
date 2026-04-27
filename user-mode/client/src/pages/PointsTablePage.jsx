import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function PointsTablePage() {
  const [points, setPoints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [groupedData, setGroupedData] = useState({});
  const [filter, setFilter] = useState("all");

  // Fetch initial data
  const fetchPoints = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/points`)
      .then((res) => {
        setPoints(res.data);
        
        // Group data by category and group
        const grouped = {};
        res.data.forEach(team => {
          const category = team.category || 'unknown';
          const groupName = team.group_name || 'No Group';
          
          if (!grouped[category]) {
            grouped[category] = {};
          }
          if (!grouped[category][groupName]) {
            grouped[category][groupName] = [];
          }
          grouped[category][groupName].push(team);
        });
        
        setGroupedData(grouped);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchPoints();
  }, []);

  // Real-time updates - points table changes based on results
  useSocket('result_created', () => {
    console.log('🔔 Result added - refreshing points table...');
    fetchPoints();
  });

  useSocket('result_updated', () => {
    console.log('🔔 Result updated - refreshing points table...');
    fetchPoints();
  });

  useSocket('result_deleted', () => {
    console.log('🔔 Result deleted - refreshing points table...');
    fetchPoints();
  });

  // Also listen for team and group updates
  useSocket('team_updated', () => {
    console.log('🔔 Team updated - refreshing points table...');
    fetchPoints();
  });

  useSocket('group_updated', () => {
    console.log('🔔 Group updated - refreshing points table...');
    fetchPoints();
  });

  const renderTable = (teams, groupName, category) => (
    <div key={`${category}-${groupName}`} className="bg-slate-800 rounded-xl border border-slate-700 overflow-hidden">
      <div className="bg-slate-900 px-6 py-4 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <h3 className="text-xl font-bold text-white">{groupName}</h3>
          <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
            category === 'men' 
              ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' 
              : 'bg-pink-500/20 text-pink-400 border border-pink-500/30'
          }`}>
            {category === 'men' ? '♂ Men' : '♀ Women'}
          </span>
        </div>
      </div>
      <div>
        <table className="w-full">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Pos</th>
              <th className="px-4 py-3 text-left text-xs font-semibold text-slate-300">Team</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">P</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">W</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">D</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">L</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">GF</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">GA</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-slate-300">GD</th>
              <th className="px-4 py-3 text-center text-xs font-semibold text-emerald-400">Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((row, idx) => (
              <tr
                key={row.team_id}
                className={`border-t border-slate-700 hover:bg-slate-750 transition-colors ${
                  idx === 0 ? 'bg-emerald-900/10' : ''
                }`}
              >
                <td className="px-4 py-3">
                  <span className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold ${
                    idx === 0 ? 'bg-emerald-500 text-white' :
                    idx === 1 ? 'bg-cyan-500 text-white' :
                    idx === 2 ? 'bg-blue-500 text-white' :
                    'bg-slate-700 text-slate-300'
                  }`}>
                    {idx + 1}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="font-semibold text-white">{row.team_name}</span>
                </td>
                <td className="px-4 py-3 text-center text-slate-300">{row.played}</td>
                <td className="px-4 py-3 text-center text-green-400">{row.won}</td>
                <td className="px-4 py-3 text-center text-yellow-400">{row.drawn}</td>
                <td className="px-4 py-3 text-center text-red-400">{row.lost}</td>
                <td className="px-4 py-3 text-center text-slate-300">{row.goals_for}</td>
                <td className="px-4 py-3 text-center text-slate-300">{row.goals_against}</td>
                <td className="px-4 py-3 text-center">
                  <span className={`font-semibold ${
                    row.goal_difference > 0 ? 'text-emerald-400' :
                    row.goal_difference < 0 ? 'text-red-400' :
                    'text-slate-300'
                  }`}>
                    {row.goal_difference > 0 ? '+' : ''}{row.goal_difference}
                  </span>
                </td>
                <td className="px-4 py-3 text-center">
                  <span className="inline-block bg-emerald-500 text-white font-bold px-3 py-1 rounded-full text-sm">
                    {row.points}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Points Table
          </h1>
          <p className="text-slate-400">Current standings and team statistics by group and category</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "all", label: "All Categories", icon: "🏆" },
            { key: "men", label: "Men's", icon: "🏒" },
            { key: "women", label: "Women's", icon: "🏑" }
          ].map(({ key, label, icon }) => (
            <button
              key={key}
              onClick={() => setFilter(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                filter === key
                  ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg"
                  : "bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white"
              }`}
            >
              <span>{icon}</span>
              <span>{label}</span>
              <span className="text-xs bg-black/20 px-2 py-1 rounded-full">
                {key === "all" ? points.length : points.filter(p => p.category === key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading points table...</div>
        ) : points.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No points data available yet.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {/* Men's Category */}
            {(filter === "all" || filter === "men") && groupedData.men && Object.keys(groupedData.men).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-blue-400 flex items-center gap-2">
                  <span>♂</span> Men's Category
                </h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {Object.entries(groupedData.men).map(([groupName, teams]) =>
                    renderTable(teams, groupName, 'men')
                  )}
                </div>
              </div>
            )}

            {/* Women's Category */}
            {(filter === "all" || filter === "women") && groupedData.women && Object.keys(groupedData.women).length > 0 && (
              <div className="space-y-6">
                <h2 className="text-3xl font-bold text-pink-400 flex items-center gap-2">
                  <span>♀</span> Women's Category
                </h2>
                <div className="grid gap-6 lg:grid-cols-2">
                  {Object.entries(groupedData.women).map(([groupName, teams]) =>
                    renderTable(teams, groupName, 'women')
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export default PointsTablePage;
