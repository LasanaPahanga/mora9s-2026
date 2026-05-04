import { Link, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import { connectUserSocket } from "../socket/userSocket.js";

function EyeIcon({ className }) {
  return (
    <svg
      className={className}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.75}
      stroke="currentColor"
      aria-hidden
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
      />
      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  );
}

function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [liveCount, setLiveCount] = useState(null);

  const isActive = (path) => location.pathname === path;

  const navItems = [
    { path: "/", label: "Home", icon: "🏠" },
    { path: "/teams", label: "Teams", icon: "🏒" },
    { path: "/matches", label: "Matches", icon: "🏆" },
    { path: "/results", label: "Results", icon: "📊" },
    { path: "/points", label: "Points", icon: "📈" },
    { path: "/top-scorers", label: "Top Scorers", icon: "⚡" },
  ];

  useEffect(() => {
    const socket = connectUserSocket();
    const onCount = (n) => setLiveCount(typeof n === "number" ? n : 0);
    socket.on("viewer_count", onCount);
    return () => {
      socket.off("viewer_count", onCount);
    };
  }, []);

  const viewerLabel =
    liveCount === null ? "—" : liveCount.toLocaleString();

  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16 gap-2">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group min-w-0 shrink">
            <img
              src="/assets/logo.png"
              alt="Mora 9s Logo"
              className="h-9 w-9 sm:h-12 sm:w-12 shrink-0 object-contain transition-transform group-hover:scale-110"
            />
            <div className="min-w-0">
              <h1 className="text-base sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all truncate max-w-[10rem] sm:max-w-none">
                Mora 9s 2026
              </h1>
              <p className="text-[10px] text-slate-400 -mt-1 hidden sm:block">Hockey Tournament</p>
            </div>
          </Link>

          <div className="flex items-center justify-end gap-1 sm:gap-2 min-w-0 flex-1 md:flex-initial">
            {/* Desktop Navigation */}
            <ul className="hidden md:flex items-center space-x-1 shrink-0">
              {navItems.map(({ path, label, icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`flex items-center gap-2 px-3 lg:px-4 py-2 rounded-lg font-medium transition-all text-sm lg:text-base ${
                      isActive(path)
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="text-lg">{icon}</span>
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>

            {/* Live viewers (public site only — server counts join_public_site room) */}
            <div
              className="flex items-center gap-1 sm:gap-1.5 shrink-0 rounded-lg border border-slate-600/80 bg-slate-800/80 px-2 py-1.5 sm:px-2.5 text-slate-300"
              title="Live connections on this website right now"
            >
              <EyeIcon className="h-4 w-4 sm:h-5 sm:w-5 text-cyan-400/90" />
              <span className="text-xs sm:text-sm font-semibold tabular-nums text-white min-w-[1.25rem] text-center">
                {viewerLabel}
              </span>
            </div>

            {/* Mobile Menu Button */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors shrink-0"
              aria-expanded={mobileMenuOpen}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {mobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-slate-700">
            <ul className="space-y-1">
              {navItems.map(({ path, label, icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive(path)
                        ? "bg-gradient-to-r from-emerald-500 to-cyan-500 text-white"
                        : "text-slate-300 hover:bg-slate-800 hover:text-white"
                    }`}
                  >
                    <span className="text-xl">{icon}</span>
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
