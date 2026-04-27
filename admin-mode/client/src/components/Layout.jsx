import { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function Layout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(() =>
    typeof window !== "undefined" ? window.matchMedia("(min-width: 1024px)").matches : true
  );

  useEffect(() => {
    const q = window.matchMedia("(min-width: 1024px)");
    const sync = () => setIsDesktop(q.matches);
    sync();
    q.addEventListener("change", sync);
    return () => q.removeEventListener("change", sync);
  }, []);
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

  const closeMobile = () => setMobileMenuOpen(false);

  const showSidebarText = !isDesktop || sidebarOpen;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col lg:flex-row">
      {/* Mobile top bar */}
      <header className="lg:hidden sticky top-0 z-40 flex items-center justify-between gap-2 px-3 py-3 bg-slate-900/95 border-b border-slate-700 backdrop-blur-sm">
        <button
          type="button"
          onClick={() => {
          setSidebarOpen(true);
          setMobileMenuOpen(true);
        }}
          className="p-2 rounded-lg text-slate-200 hover:bg-slate-800 transition-colors -ml-1"
          aria-label="Open navigation menu"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        </button>
        <span className="text-sm font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent truncate">
          Mora 9s Admin
        </span>
        <div className="w-9 shrink-0" aria-hidden="true" />
      </header>

      {/* Backdrop (mobile) */}
      {mobileMenuOpen && (
        <button
          type="button"
          className="fixed inset-0 z-40 bg-black/50 lg:hidden"
          aria-label="Close menu"
          onClick={closeMobile}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          fixed lg:static z-50 inset-y-0 left-0
          flex flex-col bg-slate-900 border-r border-slate-700
          h-full min-h-0
          w-64
          transition-transform duration-300 ease-out
          max-lg:top-0 max-lg:pt-0
          ${mobileMenuOpen ? "max-lg:translate-x-0" : "max-lg:-translate-x-full"}
          lg:translate-x-0
          ${sidebarOpen ? "lg:w-64" : "lg:w-20"}
        `}
      >
        <div className="p-4 sm:p-6 border-b border-slate-700">
          <div className="flex items-center justify-between gap-2">
            {showSidebarText ? (
              <div className="flex items-center gap-3 min-w-0">
                <img
                  src="/assets/logo.png"
                  alt="Mora 9s Logo"
                  className="h-9 w-9 sm:h-10 sm:w-10 object-contain shrink-0"
                />
                <div className="min-w-0">
                  <h1 className="text-lg sm:text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent truncate">
                    Mora 9s 2026
                  </h1>
                  <p className="text-xs text-slate-400 mt-0.5">Admin Portal</p>
                </div>
              </div>
            ) : (
              <img
                src="/assets/logo.png"
                alt="Mora 9s Logo"
                className="h-10 w-10 object-contain mx-auto"
              />
            )}
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={closeMobile}
                className="lg:hidden p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                aria-label="Close menu"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <button
                type="button"
                onClick={() => setSidebarOpen(!sidebarOpen)}
                className="hidden lg:block text-slate-400 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
                aria-label={sidebarOpen ? "Collapse sidebar" : "Expand sidebar"}
              >
                {sidebarOpen ? "◀" : "▶"}
              </button>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-3 sm:p-4 space-y-1 overflow-y-auto">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={closeMobile}
                className={`flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg transition-all ${
                  isActive
                    ? "bg-gradient-to-r from-emerald-500/20 to-cyan-500/20 text-emerald-400 border border-emerald-500/30"
                    : "text-slate-300 hover:bg-slate-800 hover:text-white"
                }`}
              >
                <span className="text-xl shrink-0">{item.icon}</span>
                {showSidebarText && <span className="font-medium">{item.label}</span>}
                {!showSidebarText && <span className="sr-only">{item.label}</span>}
              </Link>
            );
          })}
        </nav>

        <div className="p-3 sm:p-4 border-t border-slate-700">
          <button
            type="button"
            onClick={() => {
              closeMobile();
              handleLogout();
            }}
            className="flex items-center gap-3 px-3 sm:px-4 py-3 rounded-lg text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all w-full text-left"
          >
            <span className="text-xl shrink-0">🚪</span>
            {showSidebarText && <span className="font-medium">Logout</span>}
            {!showSidebarText && <span className="sr-only">Logout</span>}
          </button>
        </div>
      </aside>

      <main className="flex-1 min-w-0 min-h-0 overflow-auto">
        <div className="p-4 sm:p-6 lg:p-8 max-w-[100vw]">{children}</div>
      </main>
    </div>
  );
}

export default Layout;
