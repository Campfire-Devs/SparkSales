/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { api, setAuthToken } from "../lib/apiClient";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [account, setAccount] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("ss_account")) || null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState(() => localStorage.getItem("ss_token"));
  const [loading] = useState(false);

  useEffect(() => {
    setAuthToken(token);
    if (token) localStorage.setItem("ss_token", token);
    else localStorage.removeItem("ss_token");
  }, [token]);

  useEffect(() => {
    if (account) localStorage.setItem("ss_account", JSON.stringify(account));
    else localStorage.removeItem("ss_account");
  }, [account]);

  const register = useCallback(async (fullName, email, password) => {
    const res = await api.register({ fullName, email, password });
    setToken(res.token);
    setAccount(res.account);
    return res.account;
  }, []);

  const login = useCallback(async (email, password) => {
    const res = await api.login({ email, password });
    setToken(res.token);
    setAccount(res.account);
    return res.account;
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setAccount(null);
  }, []);

  return (
    <AuthContext.Provider value={{ account, token, loading, register, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used inside AuthProvider");
  }
  return context;
}