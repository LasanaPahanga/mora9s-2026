import { createContext, useState, useEffect } from "react";

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("adminToken"));

  useEffect(() => {
    if (token) localStorage.setItem("adminToken", token);
    else localStorage.removeItem("adminToken");
  }, [token]);

  const logout = () => {
    setToken(null);
    localStorage.removeItem("adminToken");
  };

  const value = { token, setToken, logout };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
