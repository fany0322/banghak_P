import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiService, User } from '../services/api';

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isLoggedIn: boolean;
  login: (googleToken: string) => Promise<void>;
  testLogin: (email: string, name: string) => Promise<void>;
  logout: () => Promise<void>;
  updateUser: (userData: Partial<User>) => Promise<void>;
  checkAuthStatus: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const checkAuthStatus = async () => {
    try {
      setIsLoading(true);
      const isLoggedIn = await apiService.isLoggedIn();
      
      if (isLoggedIn) {
        const currentUser = await apiService.getCurrentUser();
        if (currentUser) {
          // Verify token is still valid by making a profile request
          try {
            const profileUser = await apiService.getProfile();
            setUser(profileUser);
          } catch (error) {
            // Token invalid, clear storage
            await apiService.logout();
            setUser(null);
          }
        }
      }
    } catch (error) {
      console.error('Auth check failed:', error);
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (googleToken: string) => {
    try {
      setIsLoading(true);
      const result = await apiService.login(googleToken);
      setUser(result.user);
    } catch (error) {
      console.error('Login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const testLogin = async (email: string, name: string) => {
    try {
      setIsLoading(true);
      const result = await apiService.testLogin(email, name);
      setUser(result.user);
    } catch (error) {
      console.error('Test login failed:', error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      setIsLoading(true);
      await apiService.logout();
      setUser(null);
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateUser = async (userData: Partial<User>) => {
    try {
      await apiService.updateProfile(userData);
      // Refresh user data
      const updatedUser = await apiService.getProfile();
      setUser(updatedUser);
    } catch (error) {
      console.error('Update user failed:', error);
      throw error;
    }
  };

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const value: AuthContextType = {
    user,
    isLoading,
    isLoggedIn: !!user,
    login,
    testLogin,
    logout,
    updateUser,
    checkAuthStatus,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};