'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  email: string;
  isAdmin: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isRegistrationOpen: boolean;
  hasRegisteredUsers: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Check if admin is already registered and check session
  useEffect(() => {
    const checkAdminStatus = async () => {
      // Check for existing session
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        setUser({ email: session.user.email!, isAdmin: true });
      }

      // Check if admin is already registered globally
      const { data: config } = await supabase
        .from('admin_config')
        .select('is_registered')
        .eq('id', 1)
        .single();
      
      if (config?.is_registered) {
        setIsRegistrationOpen(false);
      }
      
      setLoading(false);
    };

    checkAdminStatus();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setUser({ email: session.user.email!, isAdmin: true });
      } else {
        setUser(null);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return false;
    }

    setUser({ email: data.user.email!, isAdmin: true });
    return true;
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    // Check if registration is closed globally
    const { data: config } = await supabase
      .from('admin_config')
      .select('is_registered')
      .eq('id', 1)
      .single();

    if (config?.is_registered) {
      return false;
    }

    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      console.error('Registration error:', error);
      return false;
    }

    // Mark as registered globally
    await supabase
      .from('admin_config')
      .update({ is_registered: true, admin_email: email })
      .eq('id', 1);

    setUser({ email: data.user.email!, isAdmin: true });
    setIsRegistrationOpen(false);
    return true;
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      logout, 
      isAuthenticated: !!user,
      isRegistrationOpen,
      hasRegisteredUsers: !isRegistrationOpen,
      loading
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
