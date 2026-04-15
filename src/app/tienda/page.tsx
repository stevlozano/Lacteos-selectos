'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';
import { MobileCart } from '@/components/MobileCart';
import { useProducts } from '@/context/ProductsContext';
import { useTheme } from '@/context/ThemeContext';

type Category = 'yogurt' | 'queso' | 'mantequilla' | 'manjar';

const categories: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'yogurt', label: 'Yogurts' },
  { id: 'queso', label: 'Quesos' },
  { id: 'mantequilla', label: 'Mantequilla' },
  { id: 'manjar', label: 'Manjar' },
];

export default function TiendaPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [mounted, setMounted] = useState(false);
  const { products } = useProducts();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const displayProducts = mounted ? filteredProducts : [];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Navbar Minimalista */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Link href="/" className="flex items-center gap-2">
              <span className="text-xl font-light tracking-tight text-black dark:text-white">
                Lácteos Selectos
              </span>
            </Link>

            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="text-sm font-light text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Inicio
              </Link>
              <Link 
                href="/tienda" 
                className="text-sm font-light text-black dark:text-white"
              >
                Tienda
              </Link>
              <Link
                href="/admin/login"
                className="text-sm font-light text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Admin
              </Link>
              <button
                onClick={toggleTheme}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {theme === 'dark' ? (
                    <>
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </>
                  ) : (
                    <>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-28 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight text-black dark:text-white">
            Hacer pedido
          </h1>
          <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 mt-2">
            Selecciona los productos que deseas ordenar
          </p>
        </div>
      </section>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-sm font-light rounded-full transition-all ${
                activeCategory === cat.id
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!mounted && (
          <div className="py-12 text-center">
            <div className="relative inline-block">
              <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-2 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        )}

        {mounted && displayProducts.length === 0 && (
          <p className="text-center text-neutral-400 dark:text-neutral-600 py-12 font-light">
            No hay productos disponibles
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 dark:border-neutral-900 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-light text-neutral-300 dark:text-neutral-700">
            © {new Date().getFullYear()} Lácteos Selectos
          </p>
        </div>
      </footer>

      <MobileCart />
      
      {/* Desktop Cart */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-30">
        <Cart />
      </div>
    </div>
  );
}
