'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useNotifications } from '@/context/NotificationsContext';

export function CustomerPermissionPrompt() {
  const { customer, isAuthenticated } = useCustomerAuth();
  const { subscribe, isSupported, isSubscribed, permission } = useNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Solo mostrar prompt si:
    // 1. El cliente está autenticado
    // 2. Las notificaciones son soportadas
    // 3. No está suscrito aún
    // 4. No ha sido descartado anteriormente
    // 5. El permiso no ha sido denegado permanentemente
    if (
      isAuthenticated && 
      customer && 
      isSupported && 
      !isSubscribed && 
      !dismissed && 
      permission !== 'denied'
    ) {
      // Esperar un poco antes de mostrar el prompt
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, customer, isSupported, isSubscribed, dismissed, permission]);

  const handleAllowNotifications = async () => {
    if (!customer) return;
    
    setIsLoading(true);
    try {
      const success = await subscribe('customer');
      if (success) {
        setShowPrompt(false);
      }
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setDismissed(true);
    setShowPrompt(false);
  };

  if (!showPrompt || !customer) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:w-96">
      <div className="bg-white dark:bg-black border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-xl p-4 space-y-4">
        {/* Header */}
        <div className="flex items-start gap-3">
          <div className="flex-shrink-0 w-10 h-10 bg-blue-100 dark:bg-blue-900/20 rounded-full flex items-center justify-center">
            <span className="material-symbols-outlined text-blue-600 dark:text-blue-400">notifications</span>
          </div>
          <div className="flex-1">
            <h3 className="font-medium text-black dark:text-white">
              ¡Bienvenido {customer.name || 'a Lácteos Selectos'}!
            </h3>
            <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-1">
              Activa las notificaciones para recibir actualizaciones sobre tus pedidos
            </p>
          </div>
          <button
            onClick={handleDismiss}
            className="flex-shrink-0 p-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* Benefits */}
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span>Recibe notificaciones cuando tu pedido esté en camino</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span>Sé notificado cuando tu pedido sea aprobado</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-neutral-600 dark:text-neutral-400">
            <span className="material-symbols-outlined text-green-600 text-lg">check_circle</span>
            <span>Alertas sobre pagos de crédito pendientes</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2">
          <button
            onClick={handleAllowNotifications}
            disabled={isLoading}
            className="flex-1 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white py-2 px-4 rounded-lg text-sm font-medium transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                Activando...
              </>
            ) : (
              <>
                <span className="material-symbols-outlined text-sm">notifications_active</span>
                Activar Notificaciones
              </>
            )}
          </button>
          <button
            onClick={handleDismiss}
            className="px-4 py-2 text-sm text-neutral-600 dark:text-neutral-400 hover:text-neutral-800 dark:hover:text-neutral-200 transition-colors"
          >
            Ahora no
          </button>
        </div>

        {/* Privacy Note */}
        <p className="text-xs text-neutral-400 dark:text-neutral-500 text-center">
          Puedes activar las notificaciones más tarde en tu perfil
        </p>
      </div>
    </div>
  );
}
