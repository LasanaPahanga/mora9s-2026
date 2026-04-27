import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";
import CategoryFilterTabs from "../components/CategoryFilterTabs";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Results() {
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expandedCards, setExpandedCards] = useState(new Set());
  const [filter, setFilter] = useState("men");

  const toggleCard = (matchId) => {
    setExpandedCards(prev => {
      const newSet = new Set(prev);
      if (newSet.has(matchId)) {
        newSet.delete(matchId);
      } else {
        newSet.add(matchId);
      }
      return newSet;
    });
  };

  // Fetch initial data
  const fetchResults = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/results`)
      .then((res) => {
        setResults(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchResults();
  }, []);

  // Real-time updates for results
  useSocket('result_created', () => {
    console.log('🔔 New result added - refreshing...');
    fetchResults();
  });

  useSocket('result_updated', () => {
    console.log('🔔 Result updated - refreshing...');
    fetchResults();
  });

  useSocket('result_deleted', () => {
    console.log('🔔 Result deleted - refreshing...');
    fetchResults();
  });

  // Also listen for match updates since they affect results
  useSocket('match_updated', () => {
    console.log('🔔 Match updated - refreshing results...');
    fetchResults();
  });

  const getResultBadge = (result, team1Name, team2Name) => {
    if (result?.includes('team_1_win')) return { text: `${team1Name} Win`, color: 'bg-green-500' };
    if (result?.includes('team_2_win')) return { text: `${team2Name} Win`, color: 'bg-blue-500' };
    if (result?.includes('draw')) return { text: 'Draw', color: 'bg-yellow-500' };
    return { text: result || 'N/A', color: 'bg-slate-500' };
  };

  const getMatchTypeStyles = (matchType) => {
    switch (matchType) {
      case 'final':
        return {
          cardBg: 'bg-gradient-to-br from-red-900/20 to-red-800/10',
          border: 'border-red-500/30',
          hoverBorder: 'hover:border-red-400',
          headerBg: 'bg-gradient-to-r from-red-900/50 to-red-800/30',
          matchBadge: 'bg-red-500 text-white',
          matchLabel: 'Final'
        };
      case 'semi_final':
        return {
          cardBg: 'bg-gradient-to-br from-orange-900/20 to-orange-800/10',
          border: 'border-orange-500/30',
          hoverBorder: 'hover:border-orange-400',
          headerBg: 'bg-gradient-to-r from-orange-900/50 to-orange-800/30',
          matchBadge: 'bg-orange-500 text-white',
          matchLabel: 'Semi Final'
        };
      case '3rd_place':
        return {
          cardBg: 'bg-gradient-to-br from-yellow-900/20 to-yellow-800/10',
          border: 'border-yellow-500/30',
          hoverBorder: 'hover:border-yellow-400',
          headerBg: 'bg-gradient-to-r from-yellow-900/50 to-yellow-800/30',
          matchBadge: 'bg-yellow-500 text-white',
          matchLabel: '3rd Place'
        };
      default: // group_stage
        return {
          cardBg: 'bg-slate-800',
          border: 'border-slate-700',
          hoverBorder: 'hover:border-emerald-500',
          headerBg: 'bg-slate-900',
          matchBadge: 'bg-blue-500 text-white',
          matchLabel: 'Group Stage'
        };
    }
  };

  const filteredResults = results.filter((result) => result.category === filter);

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
            Match Results
          </h1>
          <p className="text-slate-400">Final scores and outcomes of completed matches</p>
          <p className="text-xs text-slate-500 mt-2">💡 Click on any match card to see full details</p>
        </div>

        <CategoryFilterTabs
          value={filter}
          onChange={setFilter}
          items={[
            { key: "men", label: "Men's", icon: "🏒", count: results.filter((r) => r.category === "men").length },
            { key: "women", label: "Women's", icon: "🏑", count: results.filter((r) => r.category === "women").length },
          ]}
        />

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading results...</div>
        ) : results.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No results recorded yet.</p>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No {filter === "men" ? "men's" : "women's"} results recorded yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResults.map((r) => {
              const badge = getResultBadge(r.result, r.team_1_name, r.team_2_name);
              const matchStyles = getMatchTypeStyles(r.match_type);
              const team1Scorers = r.goal_scorers?.filter(s => s.team_id === r.team_1_id) || [];
              const team2Scorers = r.goal_scorers?.filter(s => s.team_id === r.team_2_id) || [];
              const isExpanded = expandedCards.has(r.match_id);
              const hasDetails = team1Scorers.length > 0 || team2Scorers.length > 0 || 
                                 r.penalty_score_team_1 !== null || r.match_description ||
                                 r.yellow_cards_team_1 > 0 || r.red_cards_team_1 > 0;

              return (
                <div
                  key={r.id}
                  onClick={() => toggleCard(r.match_id)}
                  className={`${matchStyles.cardBg} rounded-xl border ${matchStyles.border} ${matchStyles.hoverBorder} transition-all hover:shadow-xl overflow-hidden cursor-pointer`}
                >
                  {/* Header */}
                  <div className={`${matchStyles.headerBg} px-6 py-3 flex items-center justify-between border-b ${matchStyles.border}`}>
                    <div className="flex items-center gap-2">
                      <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                        Match #{r.match_id}
                      </span>
                      <span className={`text-xs px-2 py-1 rounded-full font-medium ${matchStyles.matchBadge}`}>
                        {matchStyles.matchLabel}
                      </span>
                      {hasDetails && (
                        <span className="text-emerald-400 text-xs">
                          {isExpanded ? '▼' : '▶'}
                        </span>
                      )}
                    </div>
                    <span className={`text-xs px-3 py-1 rounded-full text-white font-semibold ${badge.color}`}>
                      {badge.text}
                    </span>
                  </div>
                  
                  {/* Match Details */}
                  <div className="p-6">
                    {/* Teams and Scores */}
                    <div className="space-y-4 mb-6">
                      {/* Team 1 */}
                      <div className={`flex items-center justify-between p-4 rounded-lg ${
                        r.result === 'team_1_win' ? 'bg-green-900/20 border-2 border-green-500/30' : 'bg-slate-900'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-1 shadow-sm flex-shrink-0">
                              <img 
                                src={`/assets/uni_logo/${getTeamLogo(r.team_1_name)}`}
                                alt={`${r.team_1_name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-cyan-500 rounded-full hidden items-center justify-center text-xs font-bold text-white">
                                {r.team_1_name?.charAt(0)}
                              </div>
                            </div>
                            <div className="font-bold text-white text-lg">{r.team_1_name}</div>
                          </div>
                          {isExpanded && team1Scorers.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {team1Scorers.map((scorer, idx) => (
                                <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                                  <span className="text-emerald-400">⚽</span>
                                  <span>{scorer.player_name}</span>
                                  {scorer.goals_scored > 1 && (
                                    <span className="text-emerald-400">×{scorer.goals_scored}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-4xl font-bold text-emerald-400 ml-4">
                          {r.team_1_score}
                        </div>
                      </div>
                      
                      {/* Team 2 */}
                      <div className={`flex items-center justify-between p-4 rounded-lg ${
                        r.result === 'team_2_win' ? 'bg-blue-900/20 border-2 border-blue-500/30' : 'bg-slate-900'
                      }`}>
                        <div className="flex-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full overflow-hidden bg-white p-1 shadow-sm flex-shrink-0">
                              <img 
                                src={`/assets/uni_logo/${getTeamLogo(r.team_2_name)}`}
                                alt={`${r.team_2_name} logo`}
                                className="w-full h-full object-contain"
                                onError={(e) => {
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-full h-full bg-gradient-to-br from-blue-500 to-purple-500 rounded-full hidden items-center justify-center text-xs font-bold text-white">
                                {r.team_2_name?.charAt(0)}
                              </div>
                            </div>
                            <div className="font-bold text-white text-lg">{r.team_2_name}</div>
                          </div>
                          {isExpanded && team2Scorers.length > 0 && (
                            <div className="mt-2 space-y-1">
                              {team2Scorers.map((scorer, idx) => (
                                <div key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                                  <span className="text-emerald-400">⚽</span>
                                  <span>{scorer.player_name}</span>
                                  {scorer.goals_scored > 1 && (
                                    <span className="text-emerald-400">×{scorer.goals_scored}</span>
                                  )}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="text-4xl font-bold text-emerald-400 ml-4">
                          {r.team_2_score}
                        </div>
                      </div>
                    </div>
                    
                    {/* Expanded Details */}
                    {isExpanded && (
                      <>
                        {/* Penalty Shootout - Show if penalties exist */}
                        {(r.penalty_score_team_1 !== null && r.penalty_score_team_1 !== undefined && 
                          r.penalty_score_team_2 !== null && r.penalty_score_team_2 !== undefined) && (
                      <div className="mb-4 bg-yellow-900/20 border-2 border-yellow-500/50 rounded-lg p-4">
                        <div className="text-sm font-semibold text-yellow-400 mb-3 flex items-center gap-2">
                          ⚽ Penalty Shootout
                          <span className="text-xs px-2 py-0.5 bg-yellow-500/20 rounded-full">
                            {r.match_type === 'final' ? 'Final' : r.match_type === 'semi_final' ? 'Semi Final' : 'Knockout'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                          <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">{r.team_1_name}</div>
                            <div className={`text-3xl font-bold ${
                              r.penalty_score_team_1 > r.penalty_score_team_2 ? 'text-yellow-400' : 'text-slate-400'
                            }`}>
                              {r.penalty_score_team_1}
                            </div>
                          </div>
                          <div className="text-center">
                            <div className="text-xs text-slate-400 mb-1">{r.team_2_name}</div>
                            <div className={`text-3xl font-bold ${
                              r.penalty_score_team_2 > r.penalty_score_team_1 ? 'text-yellow-400' : 'text-slate-400'
                            }`}>
                              {r.penalty_score_team_2}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {/* Cards Summary */}
                    {(r.yellow_cards_team_1 > 0 || r.red_cards_team_1 > 0 || r.green_cards_team_1 > 0 ||
                      r.yellow_cards_team_2 > 0 || r.red_cards_team_2 > 0 || r.green_cards_team_2 > 0) && (
                      <div className="pt-4 border-t border-slate-700">
                        <div className="text-xs text-slate-400 mb-2">Cards</div>
                        <div className="grid grid-cols-2 gap-3">
                          <div className="text-xs space-x-2">
                            {r.yellow_cards_team_1 > 0 && <span className="text-yellow-400">🟨 {r.yellow_cards_team_1}</span>}
                            {r.red_cards_team_1 > 0 && <span className="text-red-400">🟥 {r.red_cards_team_1}</span>}
                            {r.green_cards_team_1 > 0 && <span className="text-green-400">🟩 {r.green_cards_team_1}</span>}
                          </div>
                          <div className="text-xs space-x-2 text-right">
                            {r.yellow_cards_team_2 > 0 && <span className="text-yellow-400">🟨 {r.yellow_cards_team_2}</span>}
                            {r.red_cards_team_2 > 0 && <span className="text-red-400">🟥 {r.red_cards_team_2}</span>}
                            {r.green_cards_team_2 > 0 && <span className="text-green-400">🟩 {r.green_cards_team_2}</span>}
                          </div>
                        </div>
                      </div>
                    )}
                    
                        {/* AI Match Description */}
                        {r.match_description && (
                          <div className="mt-4 pt-4 border-t border-slate-700">
                            <div className="flex items-start gap-2">
                              <span className="text-emerald-400 text-sm">✨</span>
                              <p className="text-sm text-slate-300 leading-relaxed italic">
                                {r.match_description}
                              </p>
                            </div>
                          </div>
                        )}
                      </>
                    )}
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

export default Results;
