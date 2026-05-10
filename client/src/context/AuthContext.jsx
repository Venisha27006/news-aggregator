import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../api.js';

const AuthContext = createContext(null);

const TOKEN_KEY = 'news_agg_token';

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(TOKEN_KEY));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(!!token);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const loadProfile = useCallback(async () => {
    if (!token) {
      setUser(null);
      setLoading(false);
      return;
    }
    try {
      const { data } = await api.get('/user/profile');
      setUser(data);
    } catch {
      logout();
    } finally {
      setLoading(false);
    }
  }, [token, logout]);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  const loginWithToken = useCallback((newToken, userPayload) => {
    localStorage.setItem(TOKEN_KEY, newToken);
    setToken(newToken);
    if (userPayload) {
      setUser({
        id: userPayload.id,
        name: userPayload.name,
        email: userPayload.email,
        preferences: userPayload.preferences,
      });
    }
    setLoading(false);
  }, []);

  const refreshUser = useCallback(async () => {
    if (!token) return;
    const { data } = await api.get('/user/profile');
    setUser(data);
  }, [token]);

  const value = {
    token,
    user,
    loading,
    loginWithToken,
    logout,
    refreshUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return ctx;
}
