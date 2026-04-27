import { Link, useLocation, useNavigate } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext.jsx";

function Navbar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { setToken } = useContext(AuthContext);
  
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    setToken(null);
    navigate("/login");
  };
  
  return (
    <nav className="bg-gradient-to-r from-slate-900 via-slate-800 to-slate-900 text-white shadow-lg border-b border-slate-700">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-2xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent hover:from-emerald-300 hover:to-cyan-300 transition-all">
            Admin Portal
          </Link>
          
          <div className="flex items-center space-x-1">
            <ul className="flex space-x-1">
              {[
                { path: '/dashboard', label: 'Dashboard', icon: '📊' },
                { path: '/groups', label: 'Groups', icon: '📁' },
                { path: '/teams', label: 'Teams', icon: '👥' },
                { path: '/matches', label: 'Matches', icon: '⚽' },
                { path: '/results', label: 'Results', icon: '🏆' },
                { path: '/goal-scorers', label: 'Goal Scorers', icon: '⚽' },
                { path: '/cards', label: 'Cards', icon: '🟨' }
              ].map(({ path, label, icon }) => (
                <li key={path}>
                  <Link
                    to={path}
                    className={`px-4 py-2 rounded-lg transition-all ${
                      isActive(path)
                        ? 'bg-emerald-500 text-white shadow-md'
                        : 'hover:bg-slate-700 text-slate-200'
                    }`}
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
            
            <button
              onClick={handleLogout}
              className="ml-4 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-all font-medium"
            >
              Logout
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
