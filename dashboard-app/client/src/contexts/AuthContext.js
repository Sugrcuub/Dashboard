import React, { createContext, useEffect, useState } from 'react';
import axios from 'axios';

// Create a context for authentication data and actions
export const AuthContext = createContext(null);

/**
 * Provides authentication context to the component tree.  It stores the current
 * user and JWT token, persists them in local storage and configures axios to
 * send the token on every request.  Components can access or update the auth
 * state by consuming this context.
 */
export const AuthProvider = ({ children }) => {
  // Retrieve initial state from local storage if available
  const [user, setUser] = useState(() => {
    const storedUser = localStorage.getItem('user');
    return storedUser ? JSON.parse(storedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('token'));

  // Whenever the token changes, update local storage and default axios header
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token);
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Persist user information in local storage
  useEffect(() => {
    if (user) {
      localStorage.setItem('user', JSON.stringify(user));
    } else {
      localStorage.removeItem('user');
    }
  }, [user]);

  const value = {
    user,
    setUser,
    token,
    setToken
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};