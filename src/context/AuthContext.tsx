import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { User, UserRole } from '../types.js';
import { api, getStoredToken, setStoredToken, removeStoredToken } from '../services/api.js';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  unreadCount: number;
  login: (token: string, user: User) => void;
  logout: () => void;
  refreshUser: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  quickDemoLogin: (role: 'freelancer' | 'client' | 'admin') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [unreadCount, setUnreadCount] = useState<number>(0);

  const refreshNotifications = useCallback(async () => {
    if (!getStoredToken()) return;
    try {
      const res = await api.notifications.list();
      setUnreadCount(res.unreadCount || 0);
    } catch {
      // Ignore background notification check error
    }
  }, []);

  const refreshUser = useCallback(async () => {
    const token = getStoredToken();
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const res = await api.auth.me();
      if (res.user) {
        setUser(res.user);
        await refreshNotifications();
      } else {
        removeStoredToken();
        setUser(null);
      }
    } catch (err) {
      console.error('Failed to restore session:', err);
      removeStoredToken();
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  }, [refreshNotifications]);

  useEffect(() => {
    refreshUser();
  }, [refreshUser]);

  const login = (token: string, userData: User) => {
    setStoredToken(token);
    setUser(userData);
    refreshNotifications();
  };

  const logout = () => {
    removeStoredToken();
    setUser(null);
    setUnreadCount(0);
  };

  const quickDemoLogin = async (demoRole: 'freelancer' | 'client' | 'admin') => {
    setIsLoading(true);
    try {
      const res = await api.auth.demoLogin(demoRole);
      if (res.token && res.user) {
        setStoredToken(res.token);
        setUser(res.user);
        await refreshNotifications();
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user ? user.role : null,
        isAuthenticated: !!user,
        isLoading,
        unreadCount,
        login,
        logout,
        refreshUser,
        refreshNotifications,
        quickDemoLogin,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
