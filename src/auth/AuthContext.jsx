/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";
import { api } from "../api/client";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const loadUser = async () => {
    try {
      const res = await api.post("/auth/refresh");

      if (res.data) {
        setUser(res.data.user || res.data);
      }
    } catch (e) {
      console.error("Session refresh failed:", e.response?.data || e.message);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUser();
  }, []);

  const login = async (username, password) => {
    try {
      const res = await api.post("/auth/login", { username, password });

      setUser(res.data);
      return res.data;
    } catch (e) {
      console.error("Login error:", e.response?.data || e.message);
      throw e;
    }
  };

  const register = async (username, password) => {
    try {
      const res = await api.post("/auth/register", { username, password });
      return res.data;
    } catch (e) {
      console.error("Registration error:", e.response?.data || e.message);
      throw e;
    }
  };

  const logout = async () => {
    try {
      await api.post("/auth/logout");
    } catch (e) {
      console.error("Logout error:", e.message);
    } finally {
      setUser(null);
    }
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, register, loading }}>
      {children}
    </AuthContext.Provider>
  );
};
