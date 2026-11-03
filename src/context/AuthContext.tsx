import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, FarmerProfile, ProcurementCentre, UserRole } from '../types/index.ts';

interface AuthContextType {
  user: User | null;
  farmerProfile: FarmerProfile | null;
  operatorCentre: ProcurementCentre | null;
  token: string | null;
  isLoading: boolean;
  login: (identifier: string, password: string) => Promise<void>;
  register: (data: any) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => void;
  refreshUserData: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [farmerProfile, setFarmerProfile] = useState<FarmerProfile | null>(null);
  const [operatorCentre, setOperatorCentre] = useState<ProcurementCentre | null>(null);
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('agri_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchCurrentUser = async (authToken: string) => {
    try {
      const res = await fetch('/api/auth/me', {
        headers: {
          Authorization: `Bearer ${authToken}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
        setFarmerProfile(data.profile || null);
        setOperatorCentre(data.operatorCentre || null);
      } else {
        // Token invalid or expired
        logout();
      }
    } catch (e) {
      console.warn('Network issue fetching current user:', e);
      // Try to re-use cached user if available for offline resiliency
      const cached = localStorage.getItem('agri_user');
      if (cached) {
        try {
          setUser(JSON.parse(cached));
        } catch {
          // ignore
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      fetchCurrentUser(token);
    } else {
      setIsLoading(false);
    }
  }, [token]);

  const login = async (identifier: string, password: string) => {
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ identifier, password })
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Login failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('agri_token', data.token);
    localStorage.setItem('agri_user', JSON.stringify(data.user));
    await fetchCurrentUser(data.token);
  };

  const register = async (formData: any) => {
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });

    const data = await res.json();
    if (!res.ok) {
      throw new Error(data.error || 'Registration failed');
    }

    setToken(data.token);
    setUser(data.user);
    localStorage.setItem('agri_token', data.token);
    localStorage.setItem('agri_user', JSON.stringify(data.user));
    await fetchCurrentUser(data.token);
  };

  const quickDemoLogin = async (role: UserRole) => {
    const demoCredentials: Record<UserRole, { id: string; pass: string }> = {
      farmer: { id: 'ramesh.farmer@agriconnect.in', pass: 'farmer123' },
      consumer: { id: 'priya.consumer@agriconnect.in', pass: 'consumer123' },
      operator: { id: 'vikram.operator@agriconnect.in', pass: 'operator123' },
      admin: { id: 'admin@agriconnect.in', pass: 'admin123' }
    };

    const cred = demoCredentials[role];
    if (cred) {
      await login(cred.id, cred.pass);
    }
  };

  const logout = () => {
    setUser(null);
    setFarmerProfile(null);
    setOperatorCentre(null);
    setToken(null);
    localStorage.removeItem('agri_token');
    localStorage.removeItem('agri_user');
  };

  const refreshUserData = async () => {
    if (token) {
      await fetchCurrentUser(token);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        farmerProfile,
        operatorCentre,
        token,
        isLoading,
        login,
        register,
        quickDemoLogin,
        logout,
        refreshUserData
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
