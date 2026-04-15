'use client';

import { useState, useEffect } from 'react';
import { Header } from '@/components/Header';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';
import { MobileCart } from '@/components/MobileCart';
import { useProducts } from '@/context/ProductsContext';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const [mounted, setMounted] = useState(false);
  const { products } = useProducts();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

  // Prevent hydration mismatch by not rendering products until mounted
  const displayProducts = mounted ? filteredProducts : [];

  return (
    <div className="min-h-screen bg-neutral-50 dark:bg-neutral-950 transition-colors">
      <Header />
      
      <main className="mx-auto max-w-6xl px-4 py-8">
        <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
          <div>
            <div className="mb-6">
              <CategoryFilter 
                activeCategory={activeCategory}
                onCategoryChange={setActiveCategory}
              />
            </div>
            
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {displayProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {!mounted && (
              <div className="py-12 text-center">
                <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 animate-pulse">inventory_2</span>
              </div>
            )}
            
            {mounted && displayProducts.length === 0 && (
              <p className="text-center text-neutral-500 dark:text-neutral-400 py-12">
                No hay productos en esta categoría
              </p>
            )}
          </div>
          
          <aside className="hidden lg:block lg:sticky lg:top-8 lg:self-start">
            <Cart />
          </aside>
        </div>
      </main>
      
      <MobileCart />
    </div>
  );
}
