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
  paymentMethod: 'yape' | 'efectivo' | 'credito';
  creditDueDate?: string;
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
  payment_method: 'yape' | 'efectivo' | 'credito';
  credit_due_date?: string | null;
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
  paymentMethod: dbOrder.payment_method || 'efectivo',
  creditDueDate: dbOrder.credit_due_date ? dbOrder.credit_due_date : undefined,
});

interface OrdersContextType {
  orders: Order[];
  addOrder: (order: Omit<Order, 'id' | 'createdAt' | 'status'>) => Promise<void>;
  updateOrderStatus: (id: string, status: Order['status']) => Promise<void>;
  updatePaymentMethod: (id: string, paymentMethod: Order['paymentMethod'], creditDueDate?: string) => Promise<void>;
  deleteOrder: (id: string) => Promise<void>;
  getTotalSales: () => number;
  getSalesByPaymentMethod: () => { yape: number; efectivo: number; credito: number };
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
    console.log('Adding order:', orderData);
    
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
      payment_method: orderData.paymentMethod || 'efectivo',
      credit_due_date: orderData.creditDueDate,
    };
    
    console.log('Inserting to Supabase:', newOrder);
    
    const { data, error } = await supabase.from('orders').insert(newOrder).select();
    if (error) {
      console.error('Error adding order to Supabase:', error);
      throw error;
    }
    
    console.log('Order inserted successfully:', data);
    
    // Notify admins about new order
    try {
      const { data: adminSubscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_type', 'admin');
      
      if (adminSubscriptions && adminSubscriptions.length > 0) {
        for (const sub of adminSubscriptions) {
          await fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              },
              notification: {
                title: '¡Nuevo Pedido!',
                body: `Pedido de ${orderData.customerName} - S/${orderData.total.toFixed(2)}`,
                tag: 'new-order',
                requireInteraction: true,
                data: { orderId: newOrder.id, isAdmin: true }
              }
            })
          });
        }
      }
    } catch (notifyError) {
      console.error('Error notifying admins:', notifyError);
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

  const updatePaymentMethod = async (id: string, paymentMethod: Order['paymentMethod'], creditDueDate?: string) => {
    const updateData: Partial<DBOrder> = { payment_method: paymentMethod };
    if (creditDueDate !== undefined) {
      updateData.credit_due_date = creditDueDate || null;
    }
    const { error } = await supabase.from('orders').update(updateData).eq('id', id);
    if (error) {
      console.error('Error updating payment method:', error);
      throw error;
    }
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

  const getSalesByPaymentMethod = () => {
    const completedOrders = orders.filter(o => o.status === 'completed');
    return {
      yape: completedOrders.filter(o => o.paymentMethod === 'yape').reduce((sum, o) => sum + o.total, 0),
      efectivo: completedOrders.filter(o => o.paymentMethod === 'efectivo').reduce((sum, o) => sum + o.total, 0),
      credito: completedOrders.filter(o => o.paymentMethod === 'credito').reduce((sum, o) => sum + o.total, 0),
    };
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
      updatePaymentMethod,
      deleteOrder,
      getTotalSales,
      getSalesByPaymentMethod,
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
