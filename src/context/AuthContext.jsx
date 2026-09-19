/* eslint-disable react-refresh/only-export-components */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

import {
  registerUser,
  loginUser,
  getCurrentUser,
} from "../api/authApi";

import { setAuthToken } from "../api/client";

const AuthContext = createContext(null);

const TOKEN_KEY = "ss_token";
const ACCOUNT_KEY = "ss_account";

export function AuthProvider({ children }) {
  const [token, setToken] = useState(
    () => localStorage.getItem(TOKEN_KEY)
  );

  const [account, setAccount] = useState(() => {
    try {
      const storedAccount = localStorage.getItem(ACCOUNT_KEY);
      return storedAccount ? JSON.parse(storedAccount) : null;
    } catch {
      return null;
    }
  });

  const [loading, setLoading] = useState(true);

  /*
   * Keep the API client synchronized with the current JWT.
   */
  useEffect(() => {
    setAuthToken(token);
  }, [token]);

  /*
   * Persist authentication session.
   *
   * This is authentication/session state, NOT financial application data.
   * Sales, expenses, reports, etc. will no longer use localStorage.
   */
  useEffect(() => {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  }, [token]);

  useEffect(() => {
    if (account) {
      localStorage.setItem(ACCOUNT_KEY, JSON.stringify(account));
    } else {
      localStorage.removeItem(ACCOUNT_KEY);
    }
  }, [account]);

  /*
   * Restore and validate the logged-in session when the app starts.
   */
  useEffect(() => {
    let cancelled = false;

    async function restoreSession() {
      if (!token) {
        if (!cancelled) {
          setLoading(false);
        }
        return;
      }

      try {
        const currentUser = await getCurrentUser();

        if (!cancelled) {
          setAccount(currentUser);
        }
      } catch (error) {
        console.warn("Session restoration failed:", error);

        if (!cancelled) {
          setToken(null);
          setAccount(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    return () => {
      cancelled = true;
    };
  }, [token]);

  /*
   * Register a new account through the backend.
   */
  const register = useCallback(
    async (fullName, email, password) => {
      const response = await registerUser({
        fullName,
        email,
        password,
      });

      setToken(response.token);
      setAccount(response.user);

      return response.user;
    },
    []
  );

  /*
   * Login through the backend and store the returned JWT.
   */
  const login = useCallback(
    async (email, password) => {
      const response = await loginUser({
        email,
        password,
      });

      setToken(response.token);
      setAccount(response.user);

      return response.user;
    },
    []
  );

  /*
   * End the local authenticated session.
   */
  const logout = useCallback(() => {
    setToken(null);
    setAccount(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        account,
        token,
        loading,
        register,
        login,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}