import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";
import CategoryFilterTabs from "../components/CategoryFilterTabs";
import SEO from "../components/SEO.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Teams() {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("men");

  // Fetch initial data
  const fetchTeams = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/teams`)
      .then((res) => {
        setTeams(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchTeams();
  }, []);

  // Real-time updates for teams
  useSocket('team_created', () => {
    console.log('🔔 New team created - refreshing...');
    fetchTeams();
  });

  useSocket('team_updated', () => {
    console.log('🔔 Team updated - refreshing...');
    fetchTeams();
  });

  useSocket('team_deleted', () => {
    console.log('🔔 Team deleted - refreshing...');
    fetchTeams();
  });

  // Also listen for group updates since they affect teams
  useSocket('group_updated', () => {
    console.log('🔔 Group updated - refreshing teams...');
    fetchTeams();
  });

  const filteredTeams = teams.filter((team) => team.category === filter);

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
      <SEO
        title="Participating Teams"
        description="Meet all participating teams in the Mora 9s Hockey Tournament 2026. Browse men's and women's university hockey teams."
        path="/teams"
      />
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Teams
          </h1>
          <p className="text-slate-400">All participating teams in the tournament</p>
        </div>

        <CategoryFilterTabs
          value={filter}
          onChange={setFilter}
          items={[
            { key: "men", label: "Men's", icon: "🏒", count: teams.filter((t) => t.category === "men").length },
            { key: "women", label: "Women's", icon: "🏑", count: teams.filter((t) => t.category === "women").length },
          ]}
        />

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading teams...</div>
        ) : teams.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No teams available yet.</p>
          </div>
        ) : filteredTeams.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No {filter === "men" ? "men's" : "women's"} teams in this list yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {filteredTeams.map((t) => (
              <div
                key={t.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-cyan-500 transition-all hover:shadow-xl hover:shadow-cyan-500/10 text-center"
              >
                <div className="w-20 h-20 mx-auto mb-4 rounded-full overflow-hidden bg-white p-2 shadow-lg">
                  <img 
                    src={`/assets/uni_logo/${getTeamLogo(t.name)}`}
                    alt={`${t.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      // Fallback to letter avatar if logo fails to load
                      e.target.style.display = 'none';
                      e.target.nextSibling.style.display = 'flex';
                    }}
                  />
                  <div className="w-full h-full bg-gradient-to-br from-cyan-500 to-blue-500 rounded-full hidden items-center justify-center text-2xl font-bold text-white">
                    {t.name.charAt(0)}
                  </div>
                </div>
                <h2 className="text-xl font-bold text-white mb-2">{t.name}</h2>
                {t.group_id && (
                  <span className="inline-block bg-slate-700 px-3 py-1 rounded-full text-sm text-slate-300">
                    Group {t.group_id}
                  </span>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Teams;
