import { Link, useLocation } from "react-router-dom";
import { useState } from "react";

function Navbar() {
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path) => location.pathname === path;
  
  const navItems = [
    { path: '/', label: 'Home', icon: '🏠' },
    { path: '/teams', label: 'Teams', icon: '🏒' },
    { path: '/matches', label: 'Matches', icon: '🏆' },
    { path: '/results', label: 'Results', icon: '📊' },
    { path: '/points', label: 'Points', icon: '📈' },
    { path: '/top-scorers', label: 'Top Scorers', icon: '⚡' }
  ];
  
  return (
    <nav className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50 backdrop-blur-sm bg-opacity-95">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img 
              src="/assets/logo.png" 
              alt="Mora 9s Logo" 
              className="h-12 w-12 object-contain transition-transform group-hover:scale-110"
            />
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent group-hover:from-emerald-300 group-hover:to-cyan-300 transition-all">
                Mora 9s 2026
              </h1>
              <p className="text-[10px] text-slate-400 -mt-1">Hockey Tournament</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <ul className="hidden md:flex items-center space-x-1">
            {navItems.map(({ path, label, icon }) => (
              <li key={path}>
                <Link
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                    isActive(path)
                      ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                  }`}
                >
                  <span className="text-lg">{icon}</span>
                  <span>{label}</span>
                </Link>
              </li>
            ))}
          </ul>

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden text-slate-300 hover:text-white p-2 rounded-lg hover:bg-slate-800 transition-colors"
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
                        ? 'bg-gradient-to-r from-emerald-500 to-cyan-500 text-white'
                        : 'text-slate-300 hover:bg-slate-800 hover:text-white'
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
