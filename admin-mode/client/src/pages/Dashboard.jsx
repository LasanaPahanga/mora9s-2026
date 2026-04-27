import { Link } from "react-router-dom";
import { useContext, useEffect, useState } from "react";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function Dashboard() {
  const { token } = useContext(AuthContext);
  const [stats, setStats] = useState({
    teams: 0,
    groups: 0,
    matches: 0,
    results: 0,
    finishedMatches: 0,
    upcomingMatches: 0,
  });
  const [loading, setLoading] = useState(true);

  const authConfig = {
    headers: { Authorization: `Bearer ${token}` },
  };

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsRes, groupsRes, matchesRes, resultsRes] = await Promise.all([
          axios.get(`${API_BASE}/admin/teams`, authConfig),
          axios.get(`${API_BASE}/admin/groups`, authConfig),
          axios.get(`${API_BASE}/admin/matches`, authConfig),
          axios.get(`${API_BASE}/admin/results`, authConfig),
        ]);

        const finishedMatches = matchesRes.data.filter(
          (m) => m.status === "finished"
        ).length;
        const upcomingMatches = matchesRes.data.filter(
          (m) => m.status === "scheduled"
        ).length;

        setStats({
          teams: teamsRes.data.length,
          groups: groupsRes.data.length,
          matches: matchesRes.data.length,
          results: resultsRes.data.length,
          finishedMatches,
          upcomingMatches,
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    if (token) {
      fetchStats();
    }
  }, [token]);

  const statsCards = [
    {
      title: "Total Teams",
      value: stats.teams,
      icon: "🏒",
      color: "from-blue-500 to-cyan-500",
      link: "/teams",
    },
    {
      title: "Groups",
      value: stats.groups,
      icon: "👥",
      color: "from-emerald-500 to-green-500",
      link: "/groups",
    },
    {
      title: "Total Matches",
      value: stats.matches,
      icon: "🏆",
      color: "from-orange-500 to-red-500",
      link: "/matches",
    },
    {
      title: "Completed",
      value: stats.finishedMatches,
      icon: "✅",
      color: "from-green-500 to-emerald-500",
      link: "/matches",
    },
    {
      title: "Upcoming",
      value: stats.upcomingMatches,
      icon: "⏰",
      color: "from-yellow-500 to-orange-500",
      link: "/matches",
    },
    {
      title: "Results Recorded",
      value: stats.results,
      icon: "📋",
      color: "from-purple-500 to-pink-500",
      link: "/results",
    },
  ];

  const quickLinks = [
    {
      title: "Add New Team",
      path: "/teams",
      icon: "➕",
      desc: "Register a new team",
    },
    {
      title: "Schedule Match",
      path: "/matches",
      icon: "📅",
      desc: "Create a new match",
    },
    {
      title: "Record Result",
      path: "/results",
      icon: "📊",
      desc: "Add match result",
    },
    {
      title: "Goal Scorers",
      path: "/goal-scorers",
      icon: "⚡",
      desc: "Track goal scorers",
    },
  ];

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
          Dashboard
        </h1>
        <p className="text-slate-400">
          Welcome to Mora 9s 2026 Tournament Admin Portal
        </p>
      </div>

      {loading ? (
        <div className="text-center text-slate-400 py-12">Loading statistics...</div>
      ) : (
        <>
          {/* Statistics Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {statsCards.map((card, index) => (
              <Link
                key={index}
                to={card.link}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition-all hover:shadow-xl group"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <p className="text-slate-400 text-sm mb-2">{card.title}</p>
                    <p className="text-4xl font-bold text-white group-hover:text-emerald-400 transition-colors">
                      {card.value}
                    </p>
                  </div>
                  <div
                    className={`w-14 h-14 bg-gradient-to-br ${card.color} rounded-lg flex items-center justify-center text-2xl group-hover:scale-110 transition-transform`}
                  >
                    {card.icon}
                  </div>
                </div>
              </Link>
            ))}
          </div>

          {/* Quick Actions */}
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-white mb-4">Quick Actions</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {quickLinks.map((link, index) => (
                <Link
                  key={index}
                  to={link.path}
                  className="bg-slate-800 rounded-lg p-4 border border-slate-700 hover:border-emerald-500 transition-all hover:shadow-lg group"
                >
                  <div className="flex items-center gap-3">
                    <div className="text-3xl">{link.icon}</div>
                    <div>
                      <h3 className="font-semibold text-white group-hover:text-emerald-400 transition-colors">
                        {link.title}
                      </h3>
                      <p className="text-xs text-slate-400">{link.desc}</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Tournament Status */}
          <div className="bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 rounded-xl p-6 border border-emerald-500/30">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">🏆</span>
              <div>
                <h2 className="text-xl font-bold text-white">
                  Tournament Status
                </h2>
                <p className="text-sm text-slate-400">Mora 9s Hockey Tournament 2026</p>
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Progress</p>
                <div className="flex items-center gap-2 mt-2">
                  <div className="flex-1 bg-slate-700 rounded-full h-2">
                    <div
                      className="bg-gradient-to-r from-emerald-500 to-cyan-500 h-2 rounded-full"
                      style={{
                        width: `${stats.matches > 0 ? (stats.finishedMatches / stats.matches) * 100 : 0}%`,
                      }}
                    ></div>
                  </div>
                  <span className="text-emerald-400 font-semibold text-sm">
                    {stats.matches > 0
                      ? Math.round((stats.finishedMatches / stats.matches) * 100)
                      : 0}
                    %
                  </span>
                </div>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Teams Registered</p>
                <p className="text-2xl font-bold text-white mt-1">{stats.teams}</p>
              </div>
              <div className="bg-slate-800/50 rounded-lg p-4">
                <p className="text-slate-400 text-sm">Matches Remaining</p>
                <p className="text-2xl font-bold text-white mt-1">
                  {stats.upcomingMatches}
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}

export default Dashboard;
