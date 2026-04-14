'use client';

import { useState } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import Link from 'next/link';

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();
  const { isAuthenticated, user, logout } = useAuth();
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  return (
    <>
      <header className="border-b border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-700 transition-colors">
        <div className="mx-auto max-w-6xl px-4 py-6 md:py-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-black dark:text-white">Lácteos Selectos</h1>
            <p className="mt-1 md:mt-2 text-xs md:text-sm text-neutral-500 dark:text-neutral-400">Pedidos de productos frescos directo a tu puerta</p>
          </div>
          
          <div className="flex items-center gap-2">
            {/* Botón de modo oscuro */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
                )}
              </button>
            )}

            {/* Menú de 3 puntos - Mobile */}
            <div className="relative">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors md:hidden"
                aria-label="Menú"
              >
                {/* Google Material Icons: more_vert (3 puntos) */}
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 8c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2zm0 2c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm0 6c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/>
                </svg>
              </button>

              {/* Dropdown Menu Mobile */}
              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 rounded-lg shadow-lg z-50 md:hidden">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-2 border-b border-neutral-200 dark:border-neutral-700">
                        <p className="text-sm font-medium text-black dark:text-white">{user?.email}</p>
                        <p className="text-xs text-green-600 dark:text-green-400">Admin</p>
                      </div>
                      <Link
                        href="/admin/dashboard"
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        📊 Dashboard
                      </Link>
                      <Link
                        href="/admin/products"
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        🥛 Productos
                      </Link>
                      <Link
                        href="/admin/orders"
                        className="block px-4 py-2 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        📦 Pedidos
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowMobileMenu(false);
                        }}
                        className="w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 border-t border-neutral-200 dark:border-neutral-700"
                      >
                        🚪 Cerrar Sesión
                      </button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/admin/login"
                        className="block px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        🔐 Admin Login
                      </Link>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Desktop Admin Link */}
            {isAuthenticated ? (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 text-sm font-medium hover:bg-green-200 dark:hover:bg-green-900/50 transition-colors"
              >
                <span>📊</span>
                <span>Admin</span>
              </Link>
            ) : (
              <Link
                href="/admin/login"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg border border-neutral-300 dark:border-neutral-600 text-neutral-700 dark:text-neutral-300 text-sm hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
              >
                <span>🔐</span>
                <span>Admin</span>
              </Link>
            )}
          </div>
        </div>

        {/* Mobile Navigation Bar */}
        <div className="md:hidden border-t border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900">
          <div className="flex items-center justify-between px-4 py-2">
            <span className="text-xs text-neutral-500 dark:text-neutral-400">Menú rápido</span>
            <div className="flex items-center gap-1">
              {isAuthenticated && (
                <span className="text-xs px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                  Admin ✓
                </span>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Overlay para cerrar menú */}
      {showMobileMenu && (
        <div 
          className="fixed inset-0 z-40 md:hidden" 
          onClick={() => setShowMobileMenu(false)}
        />
      )}
    </>
  );
}
