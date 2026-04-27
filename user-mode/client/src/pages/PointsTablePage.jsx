import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";
import CategoryFilterTabs from "../components/CategoryFilterTabs";

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
      <div
        className="overflow-x-auto rounded-b-xl -mx-1 px-1 sm:mx-0 sm:px-0 [scrollbar-width:thin]"
        style={{ WebkitOverflowScrolling: "touch" }}
      >
        <p className="mb-1.5 text-[10px] text-slate-500 sm:hidden">
          ← Swipe the table sideways to see GF, GA, GD, Pts →
        </p>
        <table className="w-full min-w-[34rem] border-collapse text-xs sm:min-w-full sm:text-sm">
          <thead className="bg-slate-900/50">
            <tr>
              <th className="whitespace-nowrap px-2 py-2.5 text-left text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">Pos</th>
              <th className="min-w-[5.5rem] px-2 py-2.5 text-left text-[10px] font-semibold text-slate-300 sm:min-w-0 sm:px-4 sm:py-3 sm:text-xs">Team</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">P</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">W</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">D</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">L</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">GF</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">GA</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-slate-300 sm:px-4 sm:py-3 sm:text-xs">GD</th>
              <th className="whitespace-nowrap px-2 py-2.5 text-center text-[10px] font-semibold text-emerald-400 sm:px-4 sm:py-3 sm:text-xs">Pts</th>
            </tr>
          </thead>
          <tbody>
            {teams.map((row, idx) => (
              <tr
                key={row.team_id}
                className={`border-t border-slate-700 transition-colors hover:bg-slate-700/30 ${
                  idx === 0 ? "bg-emerald-900/10" : ""
                }`}
              >
                <td className="px-2 py-2 sm:px-4 sm:py-3">
                  <span
                    className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold sm:h-7 sm:w-7 sm:text-xs ${
                      idx === 0
                        ? "bg-emerald-500 text-white"
                        : idx === 1
                          ? "bg-cyan-500 text-white"
                          : idx === 2
                            ? "bg-blue-500 text-white"
                            : "bg-slate-700 text-slate-300"
                    }`}
                  >
                    {idx + 1}
                  </span>
                </td>
                <td className="px-2 py-2 sm:px-4 sm:py-3">
                  <span className="font-semibold text-white">{row.team_name}</span>
                </td>
                <td className="px-2 py-2 text-center text-slate-300 sm:px-4 sm:py-3 tabular-nums">{row.played}</td>
                <td className="px-2 py-2 text-center text-green-400 sm:px-4 sm:py-3 tabular-nums">{row.won}</td>
                <td className="px-2 py-2 text-center text-yellow-400 sm:px-4 sm:py-3 tabular-nums">{row.drawn}</td>
                <td className="px-2 py-2 text-center text-red-400 sm:px-4 sm:py-3 tabular-nums">{row.lost}</td>
                <td className="px-2 py-2 text-center text-slate-300 sm:px-4 sm:py-3 tabular-nums">{row.goals_for}</td>
                <td className="px-2 py-2 text-center text-slate-300 sm:px-4 sm:py-3 tabular-nums">{row.goals_against}</td>
                <td className="px-2 py-2 text-center sm:px-4 sm:py-3 tabular-nums">
                  <span
                    className={`font-semibold ${
                      row.goal_difference > 0 ? "text-emerald-400" : row.goal_difference < 0 ? "text-red-400" : "text-slate-300"
                    }`}
                  >
                    {row.goal_difference > 0 ? "+" : ""}
                    {row.goal_difference}
                  </span>
                </td>
                <td className="px-2 py-2 text-center sm:px-4 sm:py-3">
                  <span className="inline-block rounded-full bg-emerald-500 px-2 py-0.5 text-xs font-bold text-white sm:px-3 sm:py-1 sm:text-sm">
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

        <CategoryFilterTabs
          value={filter}
          onChange={setFilter}
          items={[
            { key: "all", label: "All Categories", icon: "🏆", count: points.length },
            { key: "men", label: "Men's", icon: "🏒", count: points.filter((p) => p.category === "men").length },
            { key: "women", label: "Women's", icon: "🏑", count: points.filter((p) => p.category === "women").length },
          ]}
        />

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
                <h2 className="text-2xl font-bold text-blue-400 sm:text-3xl flex items-center gap-2">
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
                <h2 className="text-2xl font-bold text-pink-400 sm:text-3xl flex items-center gap-2">
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
