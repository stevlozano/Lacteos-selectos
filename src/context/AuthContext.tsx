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
  isRegistrationOpen: boolean;
  hasRegisteredUsers: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const ADMIN_EMAIL = 'admin@lacteos.com';
const ADMIN_PASSWORD = 'admin123';
const REGISTRATION_CLOSED_KEY = 'lacteos_registration_closed';

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    if (typeof window === 'undefined') return null;
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });

  const [isRegistrationOpen, setIsRegistrationOpen] = useState(() => {
    if (typeof window === 'undefined') return true;
    // Si hay un usuario guardado, el registro está cerrado
    const savedUser = localStorage.getItem('auth_user');
    if (savedUser) return false;
    const closed = localStorage.getItem(REGISTRATION_CLOSED_KEY);
    return closed !== 'true';
  });

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user = { email, isAdmin: true };
      setUser(user);
      localStorage.setItem('auth_user', JSON.stringify(user));
      // Al hacer login, cerrar el registro
      localStorage.setItem(REGISTRATION_CLOSED_KEY, 'true');
      setIsRegistrationOpen(false);
      return true;
    }
    return false;
  };

  const register = (email: string, password: string): boolean => {
    // Verificar si el registro está cerrado
    if (!isRegistrationOpen) {
      return false;
    }
    
    // Guardar credenciales en localStorage
    localStorage.setItem('admin_credentials', JSON.stringify({ email, password }));
    const user = { email, isAdmin: true };
    setUser(user);
    localStorage.setItem('auth_user', JSON.stringify(user));
    
    // Cerrar el registro - solo una persona puede registrarse
    localStorage.setItem(REGISTRATION_CLOSED_KEY, 'true');
    setIsRegistrationOpen(false);
    
    return true;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_user');
    // Nota: No reabrimos el registro al cerrar sesión, permanece cerrado
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      isRegistrationOpen,
      hasRegisteredUsers: !isRegistrationOpen
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
