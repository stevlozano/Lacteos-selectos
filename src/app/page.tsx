'use client';

import { useState } from 'react';
import { Header } from '@/components/Header';
import { CategoryFilter } from '@/components/CategoryFilter';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';
import { MobileCart } from '@/components/MobileCart';
import { useProducts } from '@/context/ProductsContext';

export default function Home() {
  const [activeCategory, setActiveCategory] = useState<string | null>(null);
  const { products } = useProducts();

  const filteredProducts = activeCategory
    ? products.filter(p => p.category === activeCategory)
    : products;

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
              {filteredProducts.map(product => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
            
            {filteredProducts.length === 0 && (
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
