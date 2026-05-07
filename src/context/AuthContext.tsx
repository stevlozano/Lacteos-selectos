'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  email: string;
  isAdmin: boolean;
}

interface BypassUser {
  email: string;
  password: string;
  isEmergency?: boolean;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string) => Promise<boolean>;
  createAdminUser: (email: string, password: string) => Promise<boolean>;
  logout: () => Promise<void>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<boolean>;
  addEmergencyAdmin: (email: string, password: string) => Promise<boolean>;
  bypassUsers: BypassUser[];
  isAuthenticated: boolean;
  isRegistrationOpen: boolean;
  hasRegisteredUsers: boolean;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const STORAGE_USER_KEY = 'auth_user';
const BYPASS_USERS_KEY = 'admin_bypass_users';

// Default bypass users
const defaultBypassUsers: BypassUser[] = [
  { email: 'jl7599409@gmail.com', password: '123456' },
  { email: 'codeolsoftware@gmail.com', password: '123456' }
];

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Check localStorage on initial load
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [bypassUsers, setBypassUsers] = useState<BypassUser[]>(() => {
    // Load bypass users from localStorage or use defaults
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(BYPASS_USERS_KEY);
      return saved ? JSON.parse(saved) : defaultBypassUsers;
    }
    return defaultBypassUsers;
  });
  const [isRegistrationOpen, setIsRegistrationOpen] = useState(true);
  const [loading, setLoading] = useState(true);

  // Check session and if any users exist (for single registration)
  useEffect(() => {
    const checkAuthStatus = async () => {
      // Check for existing Supabase session (only update if no user from localStorage)
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        const userData = { email: session.user.email!, isAdmin: true };
        setUser(userData);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      }
      
      // Check if any users exist in auth.users (single registration control)
      const { data: users } = await supabase
        .from('auth_users_view')
        .select('id')
        .limit(1);
      
      // If there are users, close registration
      if (users && users.length > 0) {
        setIsRegistrationOpen(false);
      } else {
        setIsRegistrationOpen(true);
      }
      
      setLoading(false);
    };

    checkAuthStatus();

    // Listen for auth changes - only update if there's an actual change
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const userData = { email: session.user.email!, isAdmin: true };
        setUser(userData);
        localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        localStorage.removeItem(STORAGE_USER_KEY);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    // Bypass para usuarios registrados (usa el estado actual)
    const bypass = bypassUsers.find(u => u.email === email && u.password === password);
    if (bypass) {
      const userData = { email, isAdmin: true };
      setUser(userData);
      localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
      return true;
    }
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error || !data.user) {
      return false;
    }

    const userData = { email: data.user.email!, isAdmin: true };
    setUser(userData);
    localStorage.setItem(STORAGE_USER_KEY, JSON.stringify(userData));
    return true;
  };

  const changePassword = async (currentPassword: string, newPassword: string): Promise<boolean> => {
    if (!user) {
      console.error('No user logged in');
      return false;
    }

    // Verify current password
    const bypassUser = bypassUsers.find(u => u.email === user.email && u.password === currentPassword);
    if (!bypassUser) {
      console.error('Current password is incorrect');
      return false;
    }

    // Update password
    const updatedUsers = bypassUsers.map(u => 
      u.email === user.email ? { ...u, password: newPassword } : u
    );
    
    setBypassUsers(updatedUsers);
    localStorage.setItem(BYPASS_USERS_KEY, JSON.stringify(updatedUsers));
    
    return true;
  };

  const addEmergencyAdmin = async (email: string, password: string): Promise<boolean> => {
    if (!user) {
      console.error('Only authenticated admins can add emergency users');
      return false;
    }

    // Check if email already exists
    if (bypassUsers.some(u => u.email === email)) {
      console.error('Email already exists');
      return false;
    }

    // Add new emergency admin
    const newUser: BypassUser = { email, password, isEmergency: true };
    const updatedUsers = [...bypassUsers, newUser];
    
    setBypassUsers(updatedUsers);
    localStorage.setItem(BYPASS_USERS_KEY, JSON.stringify(updatedUsers));
    
    return true;
  };

  const register = async (email: string, password: string): Promise<boolean> => {
    // Sign up with Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });

    if (error || !data.user) {
      console.error('Registration error:', error);
      return false;
    }

    // Close registration after first successful registration
    setIsRegistrationOpen(false);
    setUser({ email: data.user.email!, isAdmin: true });
    return true;
  };

  const createAdminUser = async (email: string, password: string): Promise<boolean> => {
    // Only allow if current user is authenticated
    if (!user) {
      console.error('Only authenticated admins can create new users');
      return false;
    }
    
    try {
      // Use Supabase Auth to create a new user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error || !data.user) {
        console.error('Error creating admin user:', error);
        return false;
      }

      return true;
    } catch (err) {
      console.error('Exception creating admin user:', err);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    await supabase.auth.signOut();
    localStorage.removeItem(STORAGE_USER_KEY);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      login, 
      register, 
      createAdminUser,
      logout, 
      changePassword,
      addEmergencyAdmin,
      bypassUsers,
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
