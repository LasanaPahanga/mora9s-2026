import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");

  // Fetch initial data
  const fetchMatches = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/matches`)
      .then((res) => {
        setMatches(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchMatches();
  }, []);

  // Real-time updates for matches
  useSocket('match_created', () => {
    console.log('🔔 New match created - refreshing...');
    fetchMatches();
  });

  useSocket('match_updated', () => {
    console.log('🔔 Match updated - refreshing...');
    fetchMatches();
  });

  useSocket('match_deleted', () => {
    console.log('🔔 Match deleted - refreshing...');
    fetchMatches();
  });

  const filteredMatches = matches.filter((match) => {
    if (filter === "all") return true;
    return match.category === filter;
  });

  // Function to get university logo based on team name
  const getTeamLogo = (teamName) => {
    const logoMap = {
      'Mora A': 'mora.png',
      'Mora B': 'mora.png',
      'Sabra': 'sabra.png',
      'Pera': 'pera.png',
      'Wayamba': 'wayamba.png',
      'Rajarata': 'rajarata.png',
      'Ruhuna': 'ruhuna.png',
      'Kelani': 'kelani.png',
      'Japura': 'japura.png',
      'Colombo': 'pera.png' // Assuming Colombo uses Pera logo, adjust if needed
    };
    
    return logoMap[teamName] || 'mora.png'; // Default fallback
  };

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Matches
          </h1>
          <p className="text-slate-400">Tournament match schedule and scores</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "all", label: "All Matches", icon: "🏆" },
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
                {key === "all" ? matches.length : matches.filter(m => m.category === key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No matches scheduled yet.</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No {filter === "all" ? "" : filter + "'s"} matches found.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition-all"
              >
                <div className="flex flex-col md:flex-row items-center justify-between gap-4">
                  <div className="flex items-center gap-4 flex-1 flex-wrap">
                    <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                      #{m.id}
                    </span>
                    {m.group_name && (
                      <span className="text-xs bg-emerald-900 text-emerald-300 px-3 py-1 rounded-full">
                        {m.group_name}
                      </span>
                    )}
                    {m.match_type === 'semi_final' && (
                      <span className="text-xs bg-orange-900 text-orange-300 px-3 py-1 rounded-full font-semibold">
                        Semi Final
                      </span>
                    )}
                    {m.match_type === 'final' && (
                      <span className="text-xs bg-yellow-900 text-yellow-300 px-3 py-1 rounded-full font-semibold">
                        Final
                      </span>
                    )}
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      m.status === 'finished' 
                        ? 'bg-blue-900 text-blue-300' 
                        : 'bg-amber-900 text-amber-300'
                    }`}>
                      {m.status === 'finished' ? 'Finished' : 'Scheduled'}
                    </span>
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      m.category === 'women' 
                        ? 'bg-pink-900 text-pink-300' 
                        : 'bg-blue-900 text-blue-300'
                    }`}>
                      {m.category === 'women' ? 'Women' : 'Men'}
                    </span>
                  </div>

                  <div className="flex items-center gap-6 flex-1 justify-center">
                    <div className="flex items-center gap-3 text-right flex-1 max-w-xs">
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-1 shadow-md flex-shrink-0">
                        <img 
                          src={`/assets/uni_logo/${getTeamLogo(m.team_1_name)}`}
                          alt={`${m.team_1_name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full hidden items-center justify-center text-sm font-bold text-white">
                          {m.team_1_name?.charAt(0)}
                        </div>
                      </div>
                      <div className="flex-1">
                        <div className="text-sm text-slate-400 mb-1">Team 1</div>
                        <div className={`text-xl font-bold ${
                          m.status === 'finished' && m.result === 'team_1_win' ? 'text-green-400' : 'text-white'
                        }`}>
                          {m.team_1_name}
                        </div>
                      </div>
                    </div>
                    
                    {m.status === 'finished' && m.team_1_score != null ? (
                      <div className="flex flex-col items-center gap-2">
                        <div className="flex items-center gap-3">
                          <div className="text-4xl font-bold text-emerald-400">{m.team_1_score}</div>
                          <div className="text-2xl text-slate-500">-</div>
                          <div className="text-4xl font-bold text-emerald-400">{m.team_2_score}</div>
                        </div>
                        {m.penalty_score_team_1 != null && m.penalty_score_team_2 != null && (
                          <div className="text-xs text-yellow-400 bg-yellow-900/30 px-3 py-1 rounded-full">
                            Penalties: {m.penalty_score_team_1} - {m.penalty_score_team_2}
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-2xl text-slate-600 font-bold">VS</div>
                    )}

                    <div className="flex items-center gap-3 text-left flex-1 max-w-xs">
                      <div className="flex-1">
                        <div className="text-sm text-slate-400 mb-1">Team 2</div>
                        <div className={`text-xl font-bold ${
                          m.status === 'finished' && m.result === 'team_2_win' ? 'text-blue-400' : 'text-white'
                        }`}>
                          {m.team_2_name}
                        </div>
                      </div>
                      <div className="w-12 h-12 rounded-full overflow-hidden bg-white p-1 shadow-md flex-shrink-0">
                        <img 
                          src={`/assets/uni_logo/${getTeamLogo(m.team_2_name)}`}
                          alt={`${m.team_2_name} logo`}
                          className="w-full h-full object-contain"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.nextSibling.style.display = 'flex';
                          }}
                        />
                        <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full hidden items-center justify-center text-sm font-bold text-white">
                          {m.team_2_name?.charAt(0)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Matches;
