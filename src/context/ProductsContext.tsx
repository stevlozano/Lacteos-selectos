'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product } from '@/types';
import { supabase } from '@/lib/supabase';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => Promise<void>;
  updateProduct: (id: string, product: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
  getProduct: (id: string) => Product | undefined;
  loading: boolean;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Load products from Supabase
  useEffect(() => {
    const loadProducts = async () => {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('Error loading products:', error);
        return;
      }
      
      setProducts(data || []);
      setLoading(false);
    };
    
    loadProducts();
    
    // Subscribe to real-time changes
    const channel = supabase
      .channel('products_changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'products' }, (payload) => {
        if (payload.eventType === 'INSERT') {
          setProducts(prev => [payload.new as Product, ...prev]);
        } else if (payload.eventType === 'UPDATE') {
          setProducts(prev => prev.map(p => p.id === payload.new.id ? payload.new as Product : p));
        } else if (payload.eventType === 'DELETE') {
          setProducts(prev => prev.filter(p => p.id !== payload.old.id));
        }
      })
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>) => {
    const id = `product-${Date.now()}`;
    const newProduct = { ...product, id };
    
    const { error } = await supabase.from('products').insert(newProduct);
    if (error) {
      console.error('Error adding product:', error);
      throw error;
    }
    // Real-time subscription will update the state
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    const { error } = await supabase.from('products').update(updates).eq('id', id);
    if (error) {
      console.error('Error updating product:', error);
      throw error;
    }
    // Real-time subscription will update the state
  };

  const deleteProduct = async (id: string) => {
    const { error } = await supabase.from('products').delete().eq('id', id);
    if (error) {
      console.error('Error deleting product:', error);
      throw error;
    }
    // Real-time subscription will update the state
  };

  const getProduct = (id: string) => {
    return products.find(p => p.id === id);
  };

  return (
    <ProductsContext.Provider value={{ 
      products, 
      addProduct, 
      updateProduct, 
      deleteProduct,
      getProduct,
      loading
    }}>
      {children}
    </ProductsContext.Provider>
  );
}

export function useProducts() {
  const context = useContext(ProductsContext);
  if (!context) {
    throw new Error('useProducts must be used within a ProductsProvider');
  }
  return context;
}
