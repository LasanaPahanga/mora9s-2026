import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const location = useLocation();
  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const menuItems = [
    { path: "/dashboard", icon: "📊", label: "Dashboard" },
    { path: "/groups", icon: "👥", label: "Groups" },
    { path: "/teams", icon: "🏒", label: "Teams" },
    { path: "/matches", icon: "🏆", label: "Matches" },
    { path: "/results", icon: "📋", label: "Results" },
    { path: "/goal-scorers", icon: "⚡", label: "Goal Scorers" },
    { path: "/cards", icon: "🟨", label: "Cards" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex">
      {/* Sidebar */}
      <aside
        className={`${
          sidebarOpen ? "w-64" : "w-20"
        } bg-slate-900 border-r border-slate-700 transition-all duration-300 flex flex-col`}
      >
        {/* Logo/Header */}
        <div className="p-6 border-b border-slate-700">
          <div className="flex items-center justify-between">
            {sidebarOpen ? (
              <div className="flex items-center gap-3">
                <img 
                  src="/assets/logo.png" 
                  alt="Mora 9s Logo" 
                  className="h-10 w-10 object-contain"
                />
                <div>
                  <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
                    Mora 9s 2026
                  </h1>
                  <p className="text-xs text-slate-400 mt-1">Admin Portal</p>
                </div>
              </div>
            ) : (
              <img 
                src="/assets/logo.png" 
                alt="Mora 9s Logo" 
                className="h-10 w-10 object-contain mx-auto"
              />
            )}
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              {sidebarOpen ? "◀" : "▶"}
            </button>
          </div>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-2">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-xl">{item.icon}</span>
                {sidebarOpen && (
                  <span className="font-medium">{item.label}</span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Logout Button */}
        <div className="p-4 border-t border-slate-700">
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full"
          >
            <span className="text-xl">🚪</span>
            {sidebarOpen && <span className="font-medium">Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        <div className="p-8">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
