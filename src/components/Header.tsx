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
      <header className="border-b border-neutral-100 dark:border-neutral-800 bg-white dark:bg-neutral-900 transition-colors">
        <div className="mx-auto max-w-6xl px-6 py-8 md:py-12 flex items-center justify-between">
          <div>
            <h1 className="text-4xl md:text-5xl font-extralight tracking-tight text-black dark:text-white">Lácteos Selectos</h1>
            <p className="mt-2 text-sm md:text-base text-neutral-400 dark:text-neutral-500 font-light">Pedidos de productos frescos directo a tu puerta</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* Botón de modo oscuro - minimalista */}
            {mounted && (
              <button
                onClick={toggleTheme}
                className="p-3 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
              >
                {theme === 'dark' ? (
                  <span className="material-symbols-outlined text-2xl">light_mode</span>
                ) : (
                  <span className="material-symbols-outlined text-2xl">dark_mode</span>
                )}
              </button>
            )}

            {/* Menú de 3 puntos - Mobile con Material Symbols */}
            <div className="relative md:hidden">
              <button
                onClick={() => setShowMobileMenu(!showMobileMenu)}
                className="p-3 rounded-full text-neutral-400 hover:text-neutral-600 dark:text-neutral-500 dark:hover:text-neutral-300 transition-colors"
                aria-label="Menú"
              >
                <span className="material-symbols-outlined text-2xl">more_horiz</span>
              </button>

              {/* Dropdown Menu Mobile */}
              {showMobileMenu && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white dark:bg-neutral-800 border border-neutral-100 dark:border-neutral-700 rounded-xl shadow-xl z-50 md:hidden overflow-hidden">
                  {isAuthenticated ? (
                    <>
                      <div className="px-4 py-3 border-b border-neutral-100 dark:border-neutral-700 bg-neutral-50 dark:bg-neutral-800/50">
                        <p className="text-sm font-medium text-black dark:text-white">{user?.email}</p>
                        <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-0.5">Administrador</p>
                      </div>
                      <Link
                        href="/admin/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <span className="material-symbols-outlined text-neutral-400">space_dashboard</span>
                        Dashboard
                      </Link>
                      <Link
                        href="/admin/products"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <span className="material-symbols-outlined text-neutral-400">inventory_2</span>
                        Productos
                      </Link>
                      <Link
                        href="/admin/orders"
                        className="flex items-center gap-3 px-4 py-3 text-sm text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700/50 transition-colors"
                        onClick={() => setShowMobileMenu(false)}
                      >
                        <span className="material-symbols-outlined text-neutral-400">receipt_long</span>
                        Pedidos
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setShowMobileMenu(false);
                        }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/10 transition-colors border-t border-neutral-100 dark:border-neutral-700"
                      >
                        <span className="material-symbols-outlined">logout</span>
                        Cerrar Sesión
                      </button>
                    </>
                  ) : null}
                </div>
              )}
            </div>

            {/* Desktop Admin Link - Solo visible cuando está autenticado */}
            {isAuthenticated && (
              <Link
                href="/admin/dashboard"
                className="hidden md:flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400 text-sm hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <span className="material-symbols-outlined text-sm">admin_panel_settings</span>
                Admin
              </Link>
            )}
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
