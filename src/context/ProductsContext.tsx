'use client';

import { createContext, useContext, useState, useEffect, ReactNode, useRef } from 'react';
import { Product } from '@/types';
import { products as initialProducts } from '@/data/products';

interface ProductsContextType {
  products: Product[];
  addProduct: (product: Omit<Product, 'id'>) => void;
  updateProduct: (id: string, product: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  getProduct: (id: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined);

const STORAGE_KEY = 'lacteos_products';

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(() => {
    if (typeof window === 'undefined') return initialProducts;
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? JSON.parse(saved) : initialProducts;
  });
  const isUpdatingRef = useRef(false);

  // Persist to localStorage whenever products change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (isUpdatingRef.current) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(products));
  }, [products]);

  // Listen for changes from other tabs
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const handleStorage = (e: StorageEvent) => {
      if (e.key === STORAGE_KEY) {
        const saved = localStorage.getItem(STORAGE_KEY);
        if (saved) {
          isUpdatingRef.current = true;
          setProducts(JSON.parse(saved));
          setTimeout(() => { isUpdatingRef.current = false; }, 0);
        }
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, []);

  const addProduct = (product: Omit<Product, 'id'>) => {
    const id = `product-${Date.now()}`;
    const newProduct = { ...product, id };
    setProducts(prev => [...prev, newProduct]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts(prev => prev.map(p => 
      p.id === id ? { ...p, ...updates } : p
    ));
  };

  const deleteProduct = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
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
      getProduct
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
