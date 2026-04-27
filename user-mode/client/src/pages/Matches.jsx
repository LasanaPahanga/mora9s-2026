import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";
import CategoryFilterTabs from "../components/CategoryFilterTabs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Matches() {
  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("men");

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

  const filteredMatches = matches.filter((match) => match.category === filter);

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

        <CategoryFilterTabs
          value={filter}
          onChange={setFilter}
          items={[
            { key: "men", label: "Men's", icon: "🏒", count: matches.filter((m) => m.category === "men").length },
            { key: "women", label: "Women's", icon: "🏑", count: matches.filter((m) => m.category === "women").length },
          ]}
        />

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading matches...</div>
        ) : matches.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No matches scheduled yet.</p>
          </div>
        ) : filteredMatches.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No {filter === "men" ? "men's" : "women's"} matches scheduled yet.</p>
          </div>
        ) : (
          <div className="space-y-3 sm:space-y-4">
            {filteredMatches.map((m) => (
              <div
                key={m.id}
                className="bg-slate-800/90 rounded-xl border border-slate-700 p-3 sm:p-5 hover:border-emerald-500/60 transition-all overflow-hidden shadow-lg shadow-black/20"
              >
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs bg-slate-700/90 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full text-slate-300">
                    #{m.id}
                  </span>
                  {m.group_name && (
                    <span className="text-[10px] sm:text-xs bg-emerald-900/80 text-emerald-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                      {m.group_name}
                    </span>
                  )}
                  {m.match_type === "semi_final" && (
                    <span className="text-[10px] sm:text-xs bg-orange-900/80 text-orange-200 px-2 py-0.5 rounded-full font-semibold">
                      Semi Final
                    </span>
                  )}
                  {m.match_type === "final" && (
                    <span className="text-[10px] sm:text-xs bg-yellow-900/80 text-yellow-200 px-2 py-0.5 rounded-full font-semibold">
                      Final
                    </span>
                  )}
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${
                      m.status === "finished" ? "bg-blue-900/80 text-blue-200" : "bg-amber-900/80 text-amber-200"
                    }`}
                  >
                    {m.status === "finished" ? "Finished" : "Scheduled"}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full ${
                      m.category === "women" ? "bg-pink-900/80 text-pink-200" : "bg-blue-900/80 text-blue-200"
                    }`}
                  >
                    {m.category === "women" ? "Women" : "Men"}
                  </span>
                </div>

                <div className="grid grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] gap-2 sm:gap-4 items-center min-w-0">
                  <div className="flex flex-col items-center text-center min-w-0 gap-1.5 sm:gap-2">
                    <div className="flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-slate-600/60">
                      <img
                        src={`/assets/uni_logo/${getTeamLogo(m.team_1_name)}`}
                        alt=""
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden h-full w-full items-center justify-center bg-gradient-to-br from-emerald-500 to-cyan-500 text-xs font-bold text-white sm:text-sm">
                        {m.team_1_name?.charAt(0)}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Team 1</span>
                    <p
                      className={`w-full max-w-full px-0.5 text-sm font-bold leading-snug sm:text-base ${
                        m.status === "finished" && m.result === "team_1_win" ? "text-emerald-300" : "text-white"
                      }`}
                    >
                      {m.team_1_name}
                    </p>
                  </div>

                  <div className="flex min-w-0 flex-col items-center justify-center px-0.5 sm:px-2">
                    {m.status === "finished" && m.team_1_score != null ? (
                      <div className="flex flex-col items-center gap-1">
                        <div className="flex items-baseline justify-center gap-1.5 sm:gap-2">
                          <span className="text-2xl font-bold text-emerald-400 tabular-nums sm:text-4xl">{m.team_1_score}</span>
                          <span className="text-lg text-slate-500 sm:text-2xl">–</span>
                          <span className="text-2xl font-bold text-emerald-400 tabular-nums sm:text-4xl">{m.team_2_score}</span>
                        </div>
                        {m.penalty_score_team_1 != null && m.penalty_score_team_2 != null && (
                          <div className="text-[10px] text-amber-300/90 sm:text-xs">
                            Pens {m.penalty_score_team_1}–{m.penalty_score_team_2}
                          </div>
                        )}
                      </div>
                    ) : (
                      <span className="text-lg font-bold text-slate-500 sm:text-2xl">VS</span>
                    )}
                  </div>

                  <div className="flex min-w-0 flex-col items-center gap-1.5 text-center sm:gap-2">
                    <div className="flex h-11 w-11 sm:h-14 sm:w-14 flex-shrink-0 items-center justify-center overflow-hidden rounded-full bg-white p-1 ring-2 ring-slate-600/60">
                      <img
                        src={`/assets/uni_logo/${getTeamLogo(m.team_2_name)}`}
                        alt=""
                        className="h-full w-full object-contain"
                        onError={(e) => {
                          e.target.style.display = "none";
                          e.target.nextSibling.style.display = "flex";
                        }}
                      />
                      <div className="hidden h-full w-full items-center justify-center bg-gradient-to-br from-blue-500 to-purple-500 text-xs font-bold text-white sm:text-sm">
                        {m.team_2_name?.charAt(0)}
                      </div>
                    </div>
                    <span className="text-[10px] font-medium uppercase tracking-wider text-slate-500">Team 2</span>
                    <p
                      className={`w-full max-w-full px-0.5 text-sm font-bold leading-snug sm:text-base ${
                        m.status === "finished" && m.result === "team_2_win" ? "text-cyan-300" : "text-white"
                      }`}
                    >
                      {m.team_2_name}
                    </p>
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
