import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function TopScorers() {
  const [scorers, setScorers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all"); // all, men, women

  // Fetch initial data
  const fetchTopScorers = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/top-scorers`)
      .then((res) => {
        setScorers(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTopScorers();
  }, []);

  // Real-time updates for goal scorers
  useSocket('goal_scorer_created', () => {
    console.log(' New goal scorer added - refreshing...');
    fetchTopScorers();
  });

  useSocket('goal_scorer_updated', () => {
    console.log(' Goal scorer updated - refreshing...');
    fetchTopScorers();
  });

  useSocket('goal_scorer_deleted', () => {
    console.log(' Goal scorer deleted - refreshing...');
    fetchTopScorers();
  });

  // Also listen for result updates since they affect top scorers
  useSocket('result_created', () => {
    console.log(' Result added - refreshing top scorers...');
    fetchTopScorers();
  });

  useSocket('result_updated', () => {
    console.log(' Result updated - refreshing top scorers...');
    fetchTopScorers();
  });

  const filteredScorers = scorers.filter((scorer) => {
    if (filter === "all") return true;
    return scorer.category === filter;
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
            Top Scorers
          </h1>
          <p className="text-slate-400">Leading goal scorers in the tournament</p>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mb-6">
          {[
            { key: "all", label: "All Scorers", icon: "🏆" },
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
                {key === "all" ? scorers.length : scorers.filter(s => s.category === key).length}
              </span>
            </button>
          ))}
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading top scorers...</div>
        ) : filteredScorers.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No goal scorers recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredScorers.map((scorer, index) => (
              <div
                key={`${scorer.player_name}-${scorer.team_name}`}
                className={`rounded-xl p-6 border transition-all hover:shadow-xl relative overflow-hidden ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-900/30 to-yellow-800/20 border-yellow-500/40 hover:border-yellow-400' 
                    : index === 1 
                    ? 'bg-gradient-to-br from-slate-700/30 to-slate-600/20 border-slate-400/40 hover:border-slate-300'
                    : index === 2
                    ? 'bg-gradient-to-br from-amber-900/30 to-amber-800/20 border-amber-600/40 hover:border-amber-500'
                    : 'bg-slate-800 border-slate-700 hover:border-emerald-500'
                }`}
              >
                {/* Rank Badge */}
                <div className="absolute top-4 right-4">
                  <div
                    className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-lg shadow-lg ${
                      index === 0
                        ? "bg-gradient-to-br from-yellow-400 to-yellow-600 text-yellow-900"
                        : index === 1
                        ? "bg-gradient-to-br from-slate-300 to-slate-500 text-slate-900"
                        : index === 2
                        ? "bg-gradient-to-br from-amber-500 to-amber-700 text-amber-900"
                        : "bg-gradient-to-br from-emerald-500 to-emerald-700 text-emerald-900"
                    }`}
                  >
                    #{index + 1}
                  </div>
                </div>

                {/* Player Info with Logo */}
                <div className="mb-6">
                  <div className="flex items-center gap-4 mb-3">
                    <div className="w-16 h-16 rounded-full overflow-hidden bg-white p-2 shadow-lg flex-shrink-0">
                      <img 
                        src={`/assets/uni_logo/${getTeamLogo(scorer.team_name)}`}
                        alt={`${scorer.team_name} logo`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.nextSibling.style.display = 'flex';
                        }}
                      />
                      <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full hidden items-center justify-center text-lg font-bold text-white">
                        {scorer.team_name?.charAt(0)}
                      </div>
                    </div>
                    <div className="flex-1">
                      <h3 className="text-2xl font-bold text-white mb-1">
                        {scorer.player_name}
                      </h3>
                      <p className="text-slate-300 font-medium">{scorer.team_name}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs px-3 py-1 rounded-full font-medium ${
                        scorer.category === "women"
                          ? "bg-pink-500/20 text-pink-300 border border-pink-500/30"
                          : "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      }`}
                    >
                      {scorer.category === "women" ? "🏑 Women's" : "🏒 Men's"}
                    </span>
                    {index < 3 && (
                      <span className="text-xs px-2 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        {index === 0 ? '🥇 Champion' : index === 1 ? '🥈 Runner-up' : '🥉 Third'}
                      </span>
                    )}
                  </div>
                </div>

                {/* Goals Display */}
                <div className={`rounded-lg p-6 text-center ${
                  index === 0 
                    ? 'bg-gradient-to-br from-yellow-500/20 to-yellow-600/10 border border-yellow-500/30'
                    : index === 1
                    ? 'bg-gradient-to-br from-slate-500/20 to-slate-600/10 border border-slate-400/30'
                    : index === 2
                    ? 'bg-gradient-to-br from-amber-500/20 to-amber-600/10 border border-amber-500/30'
                    : 'bg-slate-900 border border-slate-700'
                }`}>
                  <div className={`text-6xl font-bold mb-2 ${
                    index === 0 ? 'text-yellow-400' : 
                    index === 1 ? 'text-slate-300' :
                    index === 2 ? 'text-amber-400' : 'text-emerald-400'
                  }`}>
                    {scorer.total_goals}
                  </div>
                  <div className="text-sm text-slate-400 font-medium">
                    ⚽ {scorer.total_goals === 1 ? "Goal" : "Goals"}
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

export default TopScorers;
