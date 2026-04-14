'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/lib/supabase';

export interface Order {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
  }>;
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  location?: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
}

// Database type
interface DBOrder {
  id: string;
  items: Array<{
    id: string;
    name: string;
    price: number;
    quantity: number;
    unit: string;
  }>;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  notes?: string;
  location?: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  created_at: string;
}

const toOrder = (dbOrder: DBOrder): Order => ({
  id: dbOrder.id,
  items: dbOrder.items,
  customerName: dbOrder.customer_name,
  phone: dbOrder.customer_phone,
  address: dbOrder.customer_address,
  notes: dbOrder.notes,
  location: dbOrder.location,
  total: dbOrder.total,
  status: dbOrder.status,
  createdAt: dbOrder.created_at,
});

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getTotalSales: () => number;
  getOrdersByDate: (date: string) => Order[];
  getTodayOrders: () => Order[];
  loading: boolean;
}

const OrdersContext = createContext<OrdersContextType | undefined>(undefined);

export function OrdersProvider({ children }: { children: ReactNode }) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  // Load orders from Supabase
  useEffect(() => {
    const loadOrders = async () => {
      const { data, error } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading orders:', error);
        return;
      }
      
      setOrders((data || []).map(toOrder));
      setLoading(false);
    };
    
    loadOrders();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('orders_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'orders' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setOrders(prev => [toOrder(payload.new as DBOrder), ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setOrders(prev => prev.map(o => o.id === payload.new.id ? toOrder(payload.new as DBOrder) : o));
        } else if (payload.eventType === 'DELETE') {
          setOrders(prev => prev.filter(o => o.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addOrder = async (orderData: Omit<Order, 'id' | 'createdAt' | 'status'>) => {
    const newOrder = {
      id: `order-${Date.now()}`,
      items: orderData.items,
      customer_name: orderData.customerName,
      customer_phone: orderData.phone,
      customer_address: orderData.address,
      notes: orderData.notes,
      location: orderData.location,
      total: orderData.total,
      status: 'pending' as const,
      created_at: new Date().toISOString(),
    };
    
    const { error } = await supabase.from('orders').insert(newOrder);
    if (error) {
      console.error('Error adding order:', error);
      throw error;
    }
    // Real-time subscription will update the state
  };

  const updateOrderStatus = async (id: string, status: Order['status']) => {
    const { error } = await supabase.from('orders').update({ status }).eq('id', id);
    if (error) {
      console.error('Error updating order:', error);
      throw error;
    }
    // Real-time subscription will update the state
  };

  const deleteOrder = async (id: string) => {
    const { error } = await supabase.from('orders').delete().eq('id', id);
    if (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
    // Real-time subscription will update the state
  };

  const getTotalSales = () => {
    return orders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
  };

  const getOrdersByDate = (date: string) => {
    return orders.filter(o => 
      new Date(o.createdAt).toDateString() === new Date(date).toDateString()
    );
  };

  const getTodayOrders = () => {
    const today = new Date().toDateString();
    return orders.filter(o => 
      new Date(o.createdAt).toDateString() === today
    );
  };

  return (
    <OrdersContext.Provider value={{ 
      orders, 
      addOrder, 
      updateOrderStatus, 
      deleteOrder,
      getTotalSales,
      getOrdersByDate,
      getTodayOrders,
      loading
    }}>
      {children}
    </OrdersContext.Provider>
  );
}

export function useOrders() {
  const context = useContext(OrdersContext);
  if (!context) {
    throw new Error('useOrders must be used within an OrdersProvider');
  }
  return context;
}
