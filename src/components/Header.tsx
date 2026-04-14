'use client';

import { useTheme } from '@/context/ThemeContext';

export function Header() {
  const { theme, toggleTheme, mounted } = useTheme();

  return (
    <header className="border-b border-neutral-200 bg-white dark:bg-neutral-900 dark:border-neutral-700 transition-colors">
      <div className="mx-auto max-w-6xl px-4 py-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-light tracking-tight text-black dark:text-white">Lácteos Selectos</h1>
          <p className="mt-2 text-sm text-neutral-500 dark:text-neutral-400">Pedidos de productos frescos directo a tu puerta</p>
        </div>
        
        {/* Botón de modo oscuro */}
        {mounted && (
          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg border border-neutral-300 dark:border-neutral-600 bg-white dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700 transition-colors"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="5"/><path d="M12 1v2"/><path d="M12 21v2"/><path d="M4.22 4.22l1.42 1.42"/><path d="M18.36 18.36l1.42 1.42"/><path d="M1 12h2"/><path d="M21 12h2"/><path d="M4.22 19.78l1.42-1.42"/><path d="M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
