import React, { createContext, useState, useEffect, useContext } from 'react';
import AuthService from '../services/AuthService';

interface User {
  id: number;
  username: string;
  email?: string;
  [key: string]: any;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  login: (usernameOrEmail: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = async () => {
    try {
      setLoading(true);
      const response = await AuthService.checkAuth();
      
      if (response.data?.isAuthenticated && response.data?.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
      }
      setError(null);
    } catch (err: any) {
      console.error('Error checking auth:', err);
      setUser(null);
      setError(err.message || 'Ошибка проверки авторизации');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (usernameOrEmail: string, password: string): Promise<boolean> => {
    setError(null);
    setLoading(true);

    try {
      const result = await AuthService.login({ usernameOrEmail, password });

      if (result.success && result.user) {
        setUser(result.user);
        setError(null);
        return true;
      } else {
        setError(result.error || 'Неверное имя пользователя или пароль');
        setUser(null);
        return false;
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setError('Ошибка авторизации');
      setUser(null);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    try {
      await AuthService.logout();
      setUser(null);
      setError(null);
    } catch (err: any) {
      console.error('Logout error:', err);
      setError('Ошибка при выходе');
    }
  };

  const isAuthenticated = !!user;

  const value: AuthContextType = {
    user,
    loading,
    error,
    isAuthenticated,
    login,
    logout,
    checkAuth,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

