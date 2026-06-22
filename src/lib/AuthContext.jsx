import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import { loadAuthUser, saveAuthUser, clearAuthUser, loginUser, registerUser } from '@/lib/authStorage';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);

  useEffect(() => {
    setUser(loadAuthUser());
    setIsLoadingAuth(false);
  }, []);

  const login = useCallback(async (credentials) => {
    const session = loginUser(credentials);
    setUser(session);
    return session;
  }, []);

  const register = useCallback(async (data) => {
    const session = registerUser(data);
    setUser(session);
    return session;
  }, []);

  const logout = useCallback(() => {
    clearAuthUser();
    setUser(null);
  }, []);

  const navigateToLogin = useCallback(() => {
    window.location.href = '/Login';
  }, []);

  return (
    <AuthContext.Provider value={{
      user,
      isAuthenticated: !!user,
      isLoadingAuth,
      isLoadingPublicSettings: false,
      authError: null,
      login,
      register,
      logout,
      navigateToLogin,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
