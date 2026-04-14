'use client';

import { useState, useEffect } from 'react';
import { GoogleLogoLoader } from './GoogleLoader';

export function PageLoader({ children }: { children: React.ReactNode }) {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate initial page load
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1500); // 1.5 seconds loading time

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-white dark:bg-black transition-colors">
        <GoogleLogoLoader size="lg" />
        <p className="mt-6 text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest animate-pulse">
          Cargando...
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
