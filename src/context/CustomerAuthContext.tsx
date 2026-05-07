'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
  last_login?: string;
  notification_preferences: {
    order_updates: boolean;
    credit_status: boolean;
    promotions: boolean;
  };
}

interface CustomerAuthContextType {
  customer: Customer | null;
  login: (email: string, password: string) => Promise<boolean>;
  register: (email: string, password: string, name?: string, phone?: string, address?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<Customer>) => Promise<boolean>;
  isAuthenticated: boolean;
  loading: boolean;
}

const CustomerAuthContext = createContext<CustomerAuthContextType | undefined>(undefined);

const STORAGE_CUSTOMER_KEY = 'customer_user';

export function CustomerAuthProvider({ children }: { children: ReactNode }) {
  const [customer, setCustomer] = useState<Customer | null>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_CUSTOMER_KEY);
      return saved ? JSON.parse(saved) : null;
    }
    return null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkCustomerStatus = async () => {
      if (typeof window !== 'undefined') {
        const saved = localStorage.getItem(STORAGE_CUSTOMER_KEY);
        if (saved) {
          try {
            const savedCustomer = JSON.parse(saved);
            const { data: customerData } = await supabase
              .from('customers')
              .select('*')
              .eq('email', savedCustomer.email)
              .eq('is_active', true)
              .single();
            
            if (customerData) {
              setCustomer(customerData);
              localStorage.setItem(STORAGE_CUSTOMER_KEY, JSON.stringify(customerData));
            } else {
              localStorage.removeItem(STORAGE_CUSTOMER_KEY);
              setCustomer(null);
            }
          } catch (error) {
            localStorage.removeItem(STORAGE_CUSTOMER_KEY);
            setCustomer(null);
          }
        }
      }
      setLoading(false);
    };

    checkCustomerStatus();
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const { data: customerData, error } = await supabase
        .from('customers')
        .select('*')
        .eq('email', email)
        .eq('password', password)
        .eq('is_active', true)
        .single();

      if (error || !customerData) {
        return false;
      }

      // Update last login
      await supabase
        .from('customers')
        .update({ last_login: new Date().toISOString() })
        .eq('id', customerData.id);

      // Log activity
      await supabase
        .from('user_activity_log')
        .insert({
          customer_id: customerData.id,
          activity_type: 'login',
          ip_address: typeof window !== 'undefined' ? window.location.hostname : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });

      setCustomer(customerData);
      localStorage.setItem(STORAGE_CUSTOMER_KEY, JSON.stringify(customerData));
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const register = async (email: string, password: string, name?: string, phone?: string, address?: string): Promise<boolean> => {
    try {
      const { data: existingCustomer } = await supabase
        .from('customers')
        .select('email')
        .eq('email', email)
        .single();

      if (existingCustomer) {
        return false;
      }

      const { data: customerData, error } = await supabase
        .from('customers')
        .insert({
          email,
          password,
          name,
          phone,
          address
        })
        .select('*')
        .single();

      if (error || !customerData) {
        return false;
      }

      // Log registration activity
      await supabase
        .from('user_activity_log')
        .insert({
          customer_id: customerData.id,
          activity_type: 'register',
          ip_address: typeof window !== 'undefined' ? window.location.hostname : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });

      setCustomer(customerData);
      localStorage.setItem(STORAGE_CUSTOMER_KEY, JSON.stringify(customerData));
      return true;
    } catch (error) {
      console.error('Registration error:', error);
      return false;
    }
  };

  const logout = async (): Promise<void> => {
    if (customer) {
      // Log logout activity
      await supabase
        .from('user_activity_log')
        .insert({
          customer_id: customer.id,
          activity_type: 'logout',
          ip_address: typeof window !== 'undefined' ? window.location.hostname : null,
          user_agent: typeof navigator !== 'undefined' ? navigator.userAgent : null
        });
    }

    localStorage.removeItem(STORAGE_CUSTOMER_KEY);
    setCustomer(null);
  };

  const updateProfile = async (data: Partial<Customer>): Promise<boolean> => {
    if (!customer) return false;

    try {
      const { error } = await supabase
        .from('customers')
        .update(data)
        .eq('id', customer.id);

      if (error) return false;

      const updatedCustomer = { ...customer, ...data };
      setCustomer(updatedCustomer);
      localStorage.setItem(STORAGE_CUSTOMER_KEY, JSON.stringify(updatedCustomer));
      return true;
    } catch (error) {
      console.error('Update profile error:', error);
      return false;
    }
  };

  return (
    <CustomerAuthContext.Provider value={{ 
      customer, 
      login, 
      register, 
      logout,
      updateProfile,
      isAuthenticated: !!customer,
      loading
    }}>
      {children}
    </CustomerAuthContext.Provider>
  );
}

export function useCustomerAuth() {
  const context = useContext(CustomerAuthContext);
  if (!context) {
    throw new Error('useCustomerAuth must be used within a CustomerAuthProvider');
  }
  return context;
}
