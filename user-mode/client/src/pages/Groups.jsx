import { useEffect, useState } from "react";
import axios from "axios";
import useSocket from "../hooks/useSocket";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000";

function Groups() {
  const [groups, setGroups] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch initial data
  const fetchGroups = () => {
    setLoading(true);
    axios
      .get(`${API_URL}/api/groups`)
      .then((res) => {
        setGroups(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  // Real-time updates for groups
  useSocket('group_created', () => {
    console.log('🔔 New group created - refreshing...');
    fetchGroups();
  });

  useSocket('group_updated', () => {
    console.log('🔔 Group updated - refreshing...');
    fetchGroups();
  });

  useSocket('group_deleted', () => {
    console.log('🔔 Group deleted - refreshing...');
    fetchGroups();
  });

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
            Tournament Groups
          </h1>
          <p className="text-slate-400">View all tournament groups and their descriptions</p>
        </div>

        {loading ? (
          <div className="text-center text-slate-400 py-12">Loading groups...</div>
        ) : groups.length === 0 ? (
          <div className="bg-slate-800 rounded-xl p-8 text-center border border-slate-700">
            <p className="text-slate-400">No groups available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {groups.map((g) => (
              <div
                key={g.id}
                className="bg-slate-800 rounded-xl p-6 border border-slate-700 hover:border-emerald-500 transition-all hover:shadow-xl hover:shadow-emerald-500/10"
              >
                <div className="flex items-center justify-between mb-3">
                  <h2 className="text-2xl font-bold text-emerald-400">{g.name}</h2>
                  <span className="text-xs bg-slate-700 px-3 py-1 rounded-full text-slate-300">
                    ID: {g.id}
                  </span>
                </div>
                <p className="text-slate-300">{g.description || 'No description available'}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default Groups;
