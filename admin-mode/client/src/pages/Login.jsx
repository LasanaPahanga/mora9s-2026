import { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext.jsx";

const API_BASE = import.meta.env.VITE_ADMIN_API || "http://localhost:5000";

function Login() {
  const { setToken } = useContext(AuthContext);
  const navigate = useNavigate();
  const [form, setForm] = useState({ username: "", password: "" });
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    try {
      const res = await axios.post(`${API_BASE}/admin/auth/login`, form);
      setToken(res.data.token);
      navigate("/");
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="bg-slate-800 p-8 rounded-xl shadow-2xl w-96 border border-slate-700">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Admin Portal
          </h1>
          <p className="text-slate-400 mt-2">Sign in to manage the tournament</p>
        </div>
        {error && (
          <div className="bg-red-900/30 border border-red-500 text-red-300 px-4 py-3 rounded-lg mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm mb-2 text-slate-300 font-medium">Username</label>
            <input
              type="text"
              name="username"
              value={form.username}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              required
            />
          </div>
          <div>
            <label className="block text-sm mb-2 text-slate-300 font-medium">Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-slate-600 rounded-lg bg-slate-900 text-white focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 outline-none transition-all"
              required
            />
          </div>
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-emerald-500 to-cyan-500 hover:from-emerald-600 hover:to-cyan-600 text-white py-3 rounded-lg font-semibold transition-all shadow-lg hover:shadow-xl"
          >
            Sign In
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
