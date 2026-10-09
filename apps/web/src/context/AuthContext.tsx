import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api.js';

export interface UserProfile {
  id: string;
  email: string;
  mobile: string;
  status: string;
  isEmailVerified: boolean;
  profile?: {
    fullName: string;
    address?: string | null;
    city?: string | null;
    state?: string | null;
    postalCode?: string | null;
    panNumber?: string | null;
  } | null;
  roles: string[];
  permissions: string[];
}

interface AuthContextType {
  user: UserProfile | null;
  isLoading: boolean;
  isAdmin: boolean;
  isMember: boolean;
  login: (credentials: any) => Promise<UserProfile>;
  register: (data: any) => Promise<UserProfile>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchCurrentUser = async () => {
    const token = localStorage.getItem('bol_token');
    if (!token) {
      setUser(null);
      setIsLoading(false);
      return;
    }

    try {
      const data = await api.get<UserProfile>('/auth/me');
      setUser(data);
    } catch (err) {
      localStorage.removeItem('bol_token');
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  const login = async (credentials: any) => {
    const data = await api.post<any>('/auth/login', credentials);
    if (data.tokens?.accessToken) {
      localStorage.setItem('bol_token', data.tokens.accessToken);
    }
    setUser(data.user);
    return data.user;
  };

  const register = async (formData: any) => {
    const data = await api.post<any>('/auth/register', formData);
    if (data.tokens?.accessToken) {
      localStorage.setItem('bol_token', data.tokens.accessToken);
    }
    setUser(data.user);
    return data.user;
  };

  const logout = async () => {
    try {
      await api.post('/auth/logout');
    } catch (err) {
      // ignore
    } finally {
      localStorage.removeItem('bol_token');
      setUser(null);
    }
  };

  const refreshUser = async () => {
    await fetchCurrentUser();
  };

  const isAdmin = Boolean(user?.roles.some((r) => r === 'ADMIN' || r === 'SUPER_ADMIN'));
  const isMember = Boolean(user?.roles.some((r) => r === 'MEMBER'));

  return (
    <AuthContext.Provider
      value={{
        user,
        isLoading,
        isAdmin,
        isMember,
        login,
        register,
        logout,
        refreshUser,
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
