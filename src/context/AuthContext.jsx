/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useState } from 'react';

export const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || `http://${window.location.hostname}:5000/api/auth`;

  const signup = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/signup`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to sign up');
      
      const user = data.user;
      localStorage.setItem('fintrack_user', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (err) {
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      const res = await fetch(`${BACKEND_URL}/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to log in');

      const user = data.user;
      localStorage.setItem('fintrack_user', JSON.stringify(user));
      setCurrentUser(user);
      return user;
    } catch (err) {
      throw err;
    }
  };

  const logout = () => {
    return new Promise((resolve) => {
      setTimeout(() => {
        localStorage.removeItem('fintrack_user');
        setCurrentUser(null);
        resolve();
      }, 500);
    });
  };

  const setGoogleUser = (userData) => {
    localStorage.setItem('fintrack_user', JSON.stringify(userData));
    setCurrentUser(userData);
  };

  useEffect(() => {
    try {
      const storedUser = localStorage.getItem('fintrack_user');
      if (storedUser && storedUser !== 'undefined' && storedUser !== 'null') {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (e) {
      console.error("Failed to parse stored user", e);
      localStorage.removeItem('fintrack_user');
    }
    setLoading(false);
  }, []);

  const updateProfile = (updates) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updates };
    localStorage.setItem('fintrack_user', JSON.stringify(updatedUser));
    setCurrentUser(updatedUser);
  };

  const value = {
    currentUser,
    signup,
    login,
    logout,
    setGoogleUser,
    updateProfile
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};
