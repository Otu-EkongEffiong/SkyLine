// src/lib/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { supabase } from './supabaseClient';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoadingAuth, setIsLoadingAuth] = useState(true);
  const [authError, setAuthError] = useState(null);

  // 1. Core Supabase Session Synchronizer
  useEffect(() => {
    // Check initial loading session cache state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setIsLoadingAuth(false);
    });

    // Real-time listener for Magic Links clicks, token refreshes, and logouts
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setUser(session?.user ?? null);
        setIsLoadingAuth(false);
      }
    );

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // 2. Passwordless Auth: Step A (Send Magic Link/OTP Email)
  const sendMagicLink = useCallback(async (email, metadata = {}) => {
    setAuthError(null);
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        data: metadata,
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
  }, []);

  // 3. Passwordless Auth: Step B (Verify typed 6-digit OTP codes)
  const verifyOtp = useCallback(async (email, token) => {
    setAuthError(null);
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'magiclink', // default for passwordless verification setups
    });
    if (error) {
      setAuthError(error.message);
      throw error;
    }
    return data;
  }, []);

  // 4. Real Supabase Sign Out (Bridges both 'logout' and 'signOut' names)
  const logout = useCallback(async () => {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error("Error standardizing logout operation:", err);
    } finally {
      setUser(null);
    }
  }, []);

  // 5. Backwards Compatibility Routing Helpers
  const navigateToLogin = useCallback(() => {
    window.location.href = '/Login';
  }, []);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        isEmailVerified: !!user?.email_confirmed_at,
        isLoadingAuth,
        isLoadingPublicSettings: false, // Legacy fallback flag compatibility
        authError,
        sendMagicLink,
        verifyOtp,
        logout,               // Kept for structural compatibility with original files
        signOut: logout,      // Alias for new component references
        navigateToLogin,      // Preserves original redirect operations
        checkAppState: () => {},
        // Legacy stubs to prevent form submission crashes if forms aren't fully migrated yet
        login: async () => { console.warn("Passwordless authentication is active. Use sendMagicLink instead."); },
        register: async () => { console.warn("Passwordless registration is handled automatically via sendMagicLink."); }
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};