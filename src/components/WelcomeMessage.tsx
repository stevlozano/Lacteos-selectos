'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

export function WelcomeMessage() {
  const { customer, isAuthenticated } = useCustomerAuth();
  const [showWelcome, setShowWelcome] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Mostrar mensaje de bienvenida solo una vez cuando el cliente inicia sesión
    if (isAuthenticated && customer && !dismissed) {
      // Verificar si es la primera vez que ve el mensaje (usando localStorage)
      const hasSeenWelcome = localStorage.getItem(`welcome_${customer.id}`);
      if (!hasSeenWelcome) {
        // Usar setTimeout para evitar setState síncrono en el efecto
        const timer = setTimeout(() => {
          setShowWelcome(true);
        }, 100);
        return () => clearTimeout(timer);
      }
    }
  }, [isAuthenticated, customer, dismissed]);

  const handleDismiss = () => {
    if (customer) {
      localStorage.setItem(`welcome_${customer.id}`, 'true');
    }
    setDismissed(true);
    setShowWelcome(false);
  };

  if (!showWelcome || !customer) return null;

  return (
    <div className="fixed top-20 left-4 right-4 z-40 md:left-auto md:right-4 md:w-96">
      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800 rounded-lg shadow-xl p-4">
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400 text-xl">celebration</span>
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-blue-900 dark:text-blue-100">
              ¡Bienvenido {customer.name || 'a Lácteos Selectos'}!
            </h3>
            <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
              Tu cuenta está lista. Ahora puedes:
            </p>
            <ul className="mt-2 space-y-1 text-sm text-blue-600 dark:text-blue-400">
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">shopping_cart</span>
                Realizar pedidos con tus datos guardados
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">notifications</span>
                Recibir notificaciones personalizadas
              </li>
              <li className="flex items-center gap-2">
                <span className="material-symbols-outlined text-sm">history</span>
                Ver tu historial de actividad
              </li>
            </ul>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-blue-400 hover:text-blue-600 dark:hover:text-blue-200 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>
        
        <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-800">
          <p className="text-xs text-blue-600 dark:text-blue-400 text-center">
            Explora nuestros productos y disfruta de la mejor experiencia de compra
          </p>
        </div>
      </div>
    </div>
  );
}
