/**
 * PulseSEO Authentication Context
 * Provides authentication state and methods throughout the app
 */

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from './api';

interface User {
  id: string;
  email: string;
  name: string;
  company?: string;
  tenantId: string;
  role: 'owner' | 'admin' | 'member' | 'viewer';
  plan: 'free' | 'pro' | 'enterprise';
  createdAt: string;
  emailVerified: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name: string, company?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<User>) => Promise<boolean>;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    error: null,
  });

  // Check for existing session on mount
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('auth_token');
      if (token) {
        api.setToken(token);
        const response = await api.getCurrentUser();
        if (response.data?.user) {
          setState({
            user: response.data.user,
            isAuthenticated: true,
            isLoading: false,
            error: null,
          });
        } else {
          localStorage.removeItem('auth_token');
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    };

    initAuth();
  }, []);

  const login = useCallback(async (email: string, password: string): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const response = await api.login(email, password);
    
    if (response.data) {
      api.setToken(response.data.accessToken);
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: response.error || 'Login failed',
    }));
    return false;
  }, []);

  const register = useCallback(async (
    email: string,
    password: string,
    name: string,
    company?: string
  ): Promise<boolean> => {
    setState(prev => ({ ...prev, isLoading: true, error: null }));
    
    const response = await api.register(email, password, name, company);
    
    if (response.data) {
      api.setToken(response.data.accessToken);
      setState({
        user: response.data.user,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });
      return true;
    }
    
    setState(prev => ({
      ...prev,
      isLoading: false,
      error: response.error || 'Registration failed',
    }));
    return false;
  }, []);

  const logout = useCallback(async (): Promise<void> => {
    await api.logout();
    api.setToken(null);
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
    });
  }, []);

  const updateProfile = useCallback(async (data: Partial<User>): Promise<boolean> => {
    const response = await api.updateProfile(data);
    
    if (response.data?.user) {
      setState(prev => ({
        ...prev,
        user: response.data.user,
      }));
      return true;
    }
    
    return false;
  }, []);

  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateProfile,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

// Higher-order component for protected routes
export function withAuth<P extends object>(Component: React.ComponentType<P>) {
  return function ProtectedComponent(props: P) {
    const { isAuthenticated, isLoading } = useAuth();

    if (isLoading) {
      return (
        <div className="flex items-center justify-center h-screen">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      );
    }

    if (!isAuthenticated) {
      return <div>Please log in to access this page.</div>;
    }

    return <Component {...props} />;
  };
}
