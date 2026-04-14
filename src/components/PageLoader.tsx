'use client';

import { useState, useEffect } from 'react';

export function PageLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1200); // 1.2 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black transition-colors">
        {/* Minimalist spinner - respeta modo oscuro via clases Tailwind */}
        <div className="relative">
          <div className="w-12 h-12 border-2 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-2 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
        <p className="mt-6 text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest animate-pulse">
          Cargando
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
