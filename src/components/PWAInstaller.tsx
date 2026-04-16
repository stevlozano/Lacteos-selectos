'use client';

import { useState, useEffect, useCallback } from 'react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

function checkStandalone() {
  if (typeof window === 'undefined') return false;
  // Check for iOS standalone or Android display-mode
  return window.matchMedia('(display-mode: standalone)').matches || 
         (window.navigator as typeof window.navigator & { standalone?: boolean }).standalone === true;
}

function isAndroid() {
  if (typeof window === 'undefined') return false;
  return /Android/i.test(navigator.userAgent);
}

function isChrome() {
  if (typeof window === 'undefined') return false;
  return /Chrome/i.test(navigator.userAgent) && /Google Inc/i.test(navigator.vendor);
}

function isSamsungBrowser() {
  if (typeof window === 'undefined') return false;
  return /SamsungBrowser/i.test(navigator.userAgent);
}

export function PWAInstaller() {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [showInstall, setShowInstall] = useState(false);
  const [isInstalled, setIsInstalled] = useState(() => checkStandalone());
  
  // Initialize device detection once on mount
  const isAndroidDevice = typeof window !== 'undefined' ? isAndroid() : false;
  const isChromeBrowser = typeof window !== 'undefined' ? isChrome() : false;
  const isSamsung = typeof window !== 'undefined' ? isSamsungBrowser() : false;

  const handleBeforeInstallPrompt = useCallback((e: BeforeInstallPromptEvent) => {
    console.log('[PWA] beforeinstallprompt event fired');
    e.preventDefault();
    setDeferredPrompt(e);
    setShowInstall(true);
  }, []);

  const handleAppInstalled = useCallback(() => {
    console.log('[PWA] App installed');
    setShowInstall(false);
    setDeferredPrompt(null);
    setIsInstalled(true);
    window.location.reload();
  }, []);

  useEffect(() => {
    // Register service worker with update handling
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw.js')
        .then((registration) => {
          console.log('[PWA] Service Worker registered:', registration);
          
          // Check for updates
          registration.addEventListener('updatefound', () => {
            const newWorker = registration.installing;
            if (newWorker) {
              newWorker.addEventListener('statechange', () => {
                if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                  console.log('[PWA] New version available');
                }
              });
            }
          });
        })
        .catch((error) => {
          console.error('[PWA] Service Worker registration failed:', error);
        });
    }

    // Listen for beforeinstallprompt event
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);

    // Listen for app installed event
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt as EventListener);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, [handleBeforeInstallPrompt, handleAppInstalled]);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      
      if (outcome === 'accepted') {
        console.log('User accepted the install prompt');
      } else {
        console.log('User dismissed the install prompt');
      }
      
      setDeferredPrompt(null);
      setShowInstall(false);
    }
  };

  const handleDismiss = () => {
    setShowInstall(false);
    localStorage.setItem('pwa-dismissed', Date.now().toString());
  };

  // For desktop: show manual install instructions if no deferred prompt after timeout
  const [showManualInstall, setShowManualInstall] = useState(false);
  
  useEffect(() => {
    const timer = setTimeout(() => {
      if (!deferredPrompt && !isInstalled) {
        setShowManualInstall(true);
        setShowInstall(true);
      }
    }, 3000); // Show after 3 seconds if no auto prompt
    
    return () => clearTimeout(timer);
  }, [deferredPrompt, isInstalled]);

  if (!showInstall || isInstalled) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-2xl shadow-2xl p-4 md:left-auto md:right-4 md:w-80 animate-fade-in-up">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-10 h-10 bg-black dark:bg-white rounded-xl flex items-center justify-center">
          <span className="material-symbols text-white dark:text-black text-xl">download</span>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-medium text-black dark:text-white text-sm">
            Instalar Lácteos Selectos
          </h3>
          <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">
            {showManualInstall 
              ? isSamsung 
                ? "Toque el menú ⋮ → 'Agregar página a' → 'Pantalla de inicio'"
                : isAndroidDevice && !isChromeBrowser
                  ? "Abre Chrome y toca ⋮ → 'Agregar a pantalla de inicio'"
                  : "Haz clic en el menú de Chrome (⋮) → 'Instalar Lácteos Selectos' o usa el botón de Chrome en la barra de direcciones."
              : "Instala nuestra app para acceder más rápido y recibir notificaciones de tus pedidos."}
          </p>
          <div className="flex gap-2 mt-3">
            <button
              onClick={handleInstall}
              disabled={showManualInstall}
              className={`flex-1 text-xs font-medium py-2 px-3 rounded-lg transition-opacity ${
                showManualInstall 
                  ? 'bg-neutral-300 dark:bg-neutral-600 text-neutral-500 dark:text-neutral-400 cursor-not-allowed' 
                  : 'bg-black dark:bg-white text-white dark:text-black hover:opacity-80'
              }`}
            >
              {showManualInstall ? 'Usa el menú de Chrome' : 'Instalar'}
            </button>
            <button
              onClick={handleDismiss}
              className="flex-1 bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-300 text-xs font-medium py-2 px-3 rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
            >
              Ahora no
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
