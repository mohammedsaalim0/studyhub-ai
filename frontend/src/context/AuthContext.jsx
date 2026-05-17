import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext(null);
const API_BASE = import.meta.env.VITE_API_URL || '';

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('study_hub_token') || null);
  const [loading, setLoading] = useState(true);

  // Sync token changes to local storage
  useEffect(() => {
    if (token) {
      localStorage.setItem('study_hub_token', token);
    } else {
      localStorage.removeItem('study_hub_token');
    }
  }, [token]);

  // Load and verify current user on startup
  useEffect(() => {
    async function loadUser() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${API_BASE}/api/auth/me`, {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });

        if (res.ok) {
          const userData = await res.json();
          setUser(userData);
        } else {
          // Token expired or invalid
          setToken(null);
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to authenticate session:', error);
      } finally {
        setLoading(false);
      }
    }

    loadUser();
  }, [token]);

  // Register
  const register = async (username, password) => {
    const res = await fetch(`${API_BASE}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Login
  const login = async (username, password) => {
    const res = await fetch(`${API_BASE}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ username, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    return data.user;
  };

  // Logout
  const logout = () => {
    setToken(null);
    setUser(null);
  };

  // Authenticated fetch request wrapper
  const authFetch = async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(`${API_BASE}${url}`, {
      ...options,
      headers
    });

    // If session is expired on server
    if (res.status === 403) {
      logout();
      throw new Error('Your session has expired. Please log in again.');
    }

    return res;
  };

  const value = {
    user,
    token,
    loading,
    register,
    login,
    logout,
    authFetch,
    setUser
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
