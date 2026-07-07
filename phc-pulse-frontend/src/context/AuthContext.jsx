import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api, setUnauthorizedHandler } from '../utils/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem('phc_token'));
  const [user, setUser] = useState(() => {
    const raw = localStorage.getItem('phc_user');
    return raw ? JSON.parse(raw) : null;
  });

  const persist = (nextToken, nextUser) => {
    setToken(nextToken);
    setUser(nextUser);
    if (nextToken) {
      localStorage.setItem('phc_token', nextToken);
      localStorage.setItem('phc_user', JSON.stringify(nextUser));
    } else {
      localStorage.removeItem('phc_token');
      localStorage.removeItem('phc_user');
    }
  };

  const login = async (email, password) => {
    const data = await api.post('/api/auth/login', { email, password });
    persist(data.access_token, data.user);
    return data.user;
  };

  const signup = async (payload) => {
    const data = await api.post('/api/auth/signup', payload);
    persist(data.access_token, data.user);
    return data.user;
  };

  const logout = useCallback(() => {
    persist(null, null);
  }, []);

  useEffect(() => {
    setUnauthorizedHandler(() => logout());
  }, [logout]);

  return (
    <AuthContext.Provider value={{ token, user, login, signup, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
