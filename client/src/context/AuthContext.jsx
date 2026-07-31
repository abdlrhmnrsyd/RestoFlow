import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('restoflow_user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('restoflow_token') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      if (token) {
        try {
          const res = await api.get('/auth/me');
          if (res.success) {
            setUser(res.data);
            localStorage.setItem('restoflow_user', JSON.stringify(res.data));
          }
        } catch (err) {
          console.error('Failed to verify session token:', err);
          logout();
        }
      }
      setLoading(false);
    };

    fetchUser();
  }, [token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    if (res.success && res.data.token) {
      const newToken = res.data.token;
      const userData = res.data.user;
      setToken(newToken);
      setUser(userData);
      localStorage.setItem('restoflow_token', newToken);
      localStorage.setItem('restoflow_user', JSON.stringify(userData));
      return res;
    }
    throw new Error(res.message || 'Login failed');
  };

  const logout = async () => {
    try {
      if (token) {
        await api.post('/auth/logout');
      }
    } catch (e) {
      // Ignore API logout error if session expired
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('restoflow_token');
      localStorage.removeItem('restoflow_user');
    }
  };

  const updateProfile = async (data) => {
    const res = await api.put('/auth/profile', data);
    if (res.success) {
      setUser(res.data);
      localStorage.setItem('restoflow_user', JSON.stringify(res.data));
      return res;
    }
    throw new Error(res.message);
  };

  const changePassword = async (data) => {
    return await api.put('/auth/change-password', data);
  };

  const hasRole = (roleName) => {
    if (!user || !user.roles) return false;
    return user.roles.includes(roleName) || user.roles.includes('Admin');
  };

  const hasPermission = (permissionName) => {
    if (!user) return false;
    if (user.roles?.includes('Admin')) return true;
    return user.permissions?.includes(permissionName) ?? false;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        login,
        logout,
        updateProfile,
        changePassword,
        hasRole,
        hasPermission,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
