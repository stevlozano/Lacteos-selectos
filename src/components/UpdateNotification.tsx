'use client';

import { useState, useEffect } from 'react';

export function UpdateNotification() {
  const [showUpdate, setShowUpdate] = useState(false);

  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.ready.then((registration) => {
        // Listen for new service worker installation
        registration.addEventListener('updatefound', () => {
          const newWorker = registration.installing;
          
          if (newWorker) {
            newWorker.addEventListener('statechange', () => {
              // When the new worker is installed, show update prompt
              if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                setShowUpdate(true);
              }
            });
          }
        });
      });

      // Also check for updates periodically (every 30 minutes)
      const checkInterval = setInterval(() => {
        navigator.serviceWorker.ready.then((registration) => {
          registration.update();
        });
      }, 30 * 60 * 1000); // 30 minutes

      return () => clearInterval(checkInterval);
    }
  }, []);

  const handleUpdate = () => {
    setShowUpdate(false);
    // Reload to activate new service worker
    window.location.reload();
  };

  const handleDismiss = () => {
    setShowUpdate(false);
  };

  if (!showUpdate) return null;

  return (
    <div className="fixed top-4 left-4 right-4 z-50 bg-black dark:bg-white text-white dark:text-black rounded-xl shadow-2xl p-4 md:left-auto md:right-4 md:w-80 animate-fade-in-down">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 bg-white dark:bg-black rounded-lg flex items-center justify-center">
          <span className="material-symbols text-black dark:text-white text-lg">update</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-sm">
            Nueva versión disponible
          </h3>
          <p className="text-xs opacity-80 mt-1">
            Hay actualizaciones disponibles. Recarga para obtener la última versión.
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleUpdate}
              className="flex-1 bg-white dark:bg-black text-black dark:text-white text-xs font-medium py-2 px-3 rounded-lg hover:opacity-80 transition-opacity"
            >
              Recargar ahora
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-neutral-700 dark:bg-neutral-200 text-white dark:text-black text-xs font-medium py-2 px-3 rounded-lg hover:bg-neutral-600 dark:hover:bg-neutral-300 transition-colors"
            >
              Después
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
