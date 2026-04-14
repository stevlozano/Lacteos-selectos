'use client';

import { createContext, useContext, useState, ReactNode } from 'react';

interface User {
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => boolean;
  register: (email: string, password: string) => boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@lacteos.com';
const ADMIN_PASSWORD = 'admin123';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user = { email, isAdmin: true };
      setUser(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const register = (email: string, password: string): boolean => {
    // Solo permite registrar el admin único
    if (email === ADMIN_EMAIL) {
      return false; // Ya existe
    }
    // Guardar credenciales en localStorage (simulado)
    localStorage.setItem('admin_credentials', JSON.stringify({ email, password }));
    const user = { email, isAdmin: true };
    setUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user 
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
