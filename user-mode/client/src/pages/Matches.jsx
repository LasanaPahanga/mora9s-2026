import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";
import CategoryFilterTabs from "../components/CategoryFilterTabs";
import SEO from "../components/SEO.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

/** Knockout / stage ordering within each category tab */
const MATCH_STAGE_ORDER = {
  group_stage: 0,
  super6: 1,
  semi_final: 2,
  "3rd_place": 3,
  final: 4,
};

/** MySQL ENUM / drivers sometimes return non-string; keeps badges logic reliable */
function normalizeMatchType(match) {
  const raw = match?.match_type;
  if (raw == null || raw === "") return "";
  return String(raw).toLowerCase().trim().replace(/-/g, "_");
}

/** WSF1/WSF2 or MSF1/MSF2 from schedule order (same category, by match id) */
function semiFinalSlotLabel(match, allMatches) {
  if (normalizeMatchType(match) !== "semi_final") return null;
  const semis = allMatches
    .filter((x) => x.category === match.category && normalizeMatchType(x) === "semi_final")
    .sort((a, b) => a.id - b.id);
  const idx = semis.findIndex((x) => x.id === match.id);
  if (idx < 0) return null;
  const prefix = match.category === "women" ? "WSF" : "MSF";
  return `${prefix}${idx + 1}`;
}

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

  const filteredMatches = matches
    .filter((match) => match.category === filter)
    .sort((a, b) => {
      const oa = MATCH_STAGE_ORDER[normalizeMatchType(a)] ?? 99;
      const ob = MATCH_STAGE_ORDER[normalizeMatchType(b)] ?? 99;
      if (oa !== ob) return oa - ob;
      return a.id - b.id;
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
      'SLIIT': 'sliit.png',
      'Colombo': 'pera.png' // Assuming Colombo uses Pera logo, adjust if needed
    };

    if (!teamName) return 'mora.png';

    // Direct mapping first
    if (logoMap[teamName]) return logoMap[teamName];

    // Attempt slug-based filename match: e.g. "Eastern University" -> "eastern.png", "NSBM" -> "nsbm.png"
    const slug = teamName.toLowerCase().replace(/[^a-z0-9]/g, '');
    return `${slug}.png`;
  };

  return (
    <div className="py-8">
      <SEO
        title="Match Schedule & Fixtures"
        description="View the complete match schedule and fixtures for Mora 9s Hockey Tournament 2026. Men's and women's categories."
        path="/matches"
      />
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
            {filteredMatches.map((m) => {
              const semiLabel = semiFinalSlotLabel(m, matches);
              const mt = normalizeMatchType(m);
              return (
              <div
                key={m.id}
                className="bg-slate-800/90 rounded-xl border border-slate-700 p-3 sm:p-5 hover:border-emerald-500/60 transition-all overflow-hidden shadow-lg shadow-black/20"
              >
                <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs bg-slate-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium text-white">
                    #{m.id}
                  </span>
                  {semiLabel && (
                    <span className="text-[10px] sm:text-xs bg-slate-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-bold tracking-wide text-white">
                      {semiLabel}
                    </span>
                  )}
                  {mt === "super6" && (
                    <span className="text-[10px] sm:text-xs bg-cyan-600 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-semibold text-white">
                      Super 6
                    </span>
                  )}
                  {m.group_name && mt !== "semi_final" && mt !== "super6" && (
                    <span className="text-[10px] sm:text-xs bg-emerald-900/80 text-emerald-200 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full">
                      {m.group_name}
                    </span>
                  )}
                  {mt === "semi_final" && (
                    <span className="text-[10px] sm:text-xs bg-[#f97316] px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-semibold text-white shadow-sm ring-1 ring-white/10">
                      Semi Final
                    </span>
                  )}
                  {mt === "final" && (
                    <span className="text-[10px] sm:text-xs bg-yellow-900/80 text-yellow-200 px-2 py-0.5 rounded-full font-semibold">
                      Final
                    </span>
                  )}
                  {mt === "3rd_place" && (
                    <span className="text-[10px] sm:text-xs bg-amber-900/80 text-amber-200 px-2 py-0.5 rounded-full font-semibold">
                      3rd Place
                    </span>
                  )}
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium ${
                      m.status === "finished"
                        ? "bg-blue-800 text-white"
                        : "bg-[#c2410c] text-white"
                    }`}
                  >
                    {m.status === "finished" ? "Finished" : "Scheduled"}
                  </span>
                  <span
                    className={`text-[10px] sm:text-xs px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-full font-medium ${
                      m.category === "women"
                        ? "bg-pink-800 text-white"
                        : "bg-blue-600 text-white"
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
            );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default Matches;
