import { Link } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import ImageSlider from "../components/ImageSlider.jsx";
import SEO from "../components/SEO.jsx";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Home() {
  const [stats, setStats] = useState({
    teams: 0,
    matches: 0,
    results: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [teamsRes, matchesRes, resultsRes] = await Promise.all([
          axios.get(`${API_URL}/api/teams`),
          axios.get(`${API_URL}/api/matches`),
          axios.get(`${API_URL}/api/results`),
        ]);

        setStats({
          teams: teamsRes.data.length,
          matches: matchesRes.data.length,
          results: resultsRes.data.length,
        });
      } catch (err) {
        console.error("Error fetching stats", err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const features = [
    {
      title: "Teams",
      path: "/teams",
      icon: "🏒",
      desc: "Browse all participating teams",
      color: "from-blue-500 to-cyan-500",
    },
    {
      title: "Matches",
      path: "/matches",
      icon: "🏆",
      desc: "View complete match schedule",
      color: "from-orange-500 to-red-500",
    },
    {
      title: "Results",
      path: "/results",
      icon: "📊",
      desc: "Check match results & scores",
      color: "from-purple-500 to-pink-500",
    },
    {
      title: "Points Table",
      path: "/points",
      icon: "📈",
      desc: "Live tournament standings",
      color: "from-green-500 to-emerald-500",
    },
    {
      title: "Top Scorers",
      path: "/top-scorers",
      icon: "⚡",
      desc: "Leading goal scorers",
      color: "from-yellow-500 to-orange-500",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <SEO
        title="Mora 9s Hockey Tournament 2026"
        description="Official website for Mora 9s Hockey Tournament 2026. Live scores, match results, team standings, and top scorers. Your official source for all tournament updates."
        path="/"
      />
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiMxZTI5M2IiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6bTAtMjBjMC0yLjIwOS0xLjc5MS00LTQtNHMtNCAxLjc5MS00IDQgMS43OTEgNCA0IDQgNC0xLjc5MSA0LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')] opacity-20"></div>
        
        <div className="container mx-auto px-4 py-10 sm:py-16 md:py-20 relative">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-block mb-4 sm:mb-6 px-3 sm:px-4 py-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full">
              <span className="text-emerald-400 text-xs sm:text-sm font-semibold">🏆 Official Tournament Website</span>
            </div>
            
            {/* Logo */}
            <div className="mb-6 sm:mb-8">
              <img 
                src="/assets/logo.png" 
                alt="Mora 9s Tournament Logo" 
                className="h-24 sm:h-32 md:h-40 w-auto mx-auto object-contain animate-pulse"
                fetchpriority="high"
              />
            </div>
            
            <h1 className="text-3xl sm:text-5xl md:text-7xl font-black mb-4 sm:mb-6 bg-gradient-to-r from-emerald-400 via-cyan-400 to-blue-400 bg-clip-text text-transparent leading-tight px-1">
              Mora 9s Hockey
              <br />
              Tournament 2026
            </h1>
            
            <p className="text-base sm:text-xl md:text-2xl text-slate-300 mb-6 sm:mb-8 max-w-2xl mx-auto leading-relaxed px-1">
              Experience the thrill of competitive hockey. Follow live scores, track your favorite teams, and witness sporting excellence.
            </p>

            {/* Quick Stats */}
            {!loading && (
              <div className="flex flex-wrap justify-center gap-6 sm:gap-8 mb-8 sm:mb-12">
                <div className="text-center min-w-[4.5rem]">
                  <div className="text-3xl sm:text-4xl font-bold text-emerald-400">{stats.teams}</div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1">Teams</div>
                </div>
                <div className="text-center min-w-[4.5rem]">
                  <div className="text-3xl sm:text-4xl font-bold text-cyan-400">{stats.matches}</div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1">Matches</div>
                </div>
                <div className="text-center min-w-[4.5rem]">
                  <div className="text-3xl sm:text-4xl font-bold text-purple-400">{stats.results}</div>
                  <div className="text-xs sm:text-sm text-slate-400 mt-1">Completed</div>
                </div>
              </div>
            )}

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3 sm:gap-4 w-full max-w-md sm:max-w-none mx-auto">
              <Link
                to="/results"
                className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white rounded-lg font-semibold shadow-lg shadow-emerald-500/30 hover:shadow-xl hover:shadow-emerald-500/40 transition-all sm:hover:scale-105"
              >
                View Results
              </Link>
              <Link
                to="/points"
                className="w-full sm:w-auto text-center px-6 sm:px-8 py-3 sm:py-4 bg-slate-800 hover:bg-slate-700 text-white rounded-lg font-semibold border border-slate-700 hover:border-slate-600 transition-all sm:hover:scale-105"
              >
                Points Table
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Image Slider */}
      <div className="container mx-auto px-4 py-12">
        <ImageSlider />
      </div>

      {/* Features Grid */}
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-3">Explore Tournament</h2>
          <p className="text-slate-400">Access all tournament information in one place</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {features.map((feature) => (
            <Link
              key={feature.path}
              to={feature.path}
              className="bg-slate-800/50 backdrop-blur rounded-xl p-6 border border-slate-700 hover:border-slate-600 transition-all hover:scale-105 hover:shadow-xl group"
            >
              <div
                className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center text-3xl mb-4 group-hover:scale-110 transition-transform`}
              >
                {feature.icon}
              </div>
              <h3 className="text-xl font-bold mb-2 text-white group-hover:text-emerald-400 transition-colors">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm">{feature.desc}</p>
              <div className="mt-4 text-emerald-400 text-sm font-medium flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                Explore <span>→</span>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* Tournament Info Banner */}
      <div className="container mx-auto px-4 pb-16">
        <div className="bg-gradient-to-r from-emerald-500/10 via-cyan-500/10 to-blue-500/10 rounded-2xl p-5 sm:p-8 md:p-12 border border-emerald-500/20">
          <div className="flex flex-col md:flex-row items-center gap-4 md:gap-6 text-center md:text-left">
            <div className="text-4xl sm:text-6xl shrink-0">🏟️</div>
            <div className="flex-1 min-w-0">
              <h3 className="text-lg sm:text-2xl font-bold text-white mb-2">
                Tournament in Progress
              </h3>
              <p className="text-slate-300 text-sm sm:text-base">
                Follow every match, every goal, and every moment of this exciting hockey tournament. Stay updated with real-time results and standings.
              </p>
            </div>
            <Link
              to="/matches"
              className="w-full md:w-auto shrink-0 px-6 py-3 bg-white text-slate-900 rounded-lg font-semibold hover:bg-slate-100 transition-all text-center"
            >
              View Fixtures
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
