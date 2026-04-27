'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/context/NotificationsContext';

export function AdminNotificationPrompt() {
  const { isSupported, permission, isSubscribed, subscribe, requestPermission } = useNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Verificar si ya está suscrito o si no es soportado
    if (!isSupported) return;
    
    // Mostrar prompt si:
    // - No está suscrito
    // - El permiso no está denegado permanentemente
    if (!isSubscribed && permission !== 'denied') {
      // Esperar 2 segundos para no interrumpir la carga inicial
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isSupported, isSubscribed, permission]);

  const handleSubscribe = async () => {
    setIsLoading(true);
    try {
      // Si el permiso es default, solicitar primero
      if (permission === 'default') {
        const result = await requestPermission();
        if (result === 'denied') {
          setShowPrompt(false);
          alert('Has denegado los permisos de notificación. Para recibir alertas de nuevos pedidos, habilita las notificaciones en la configuración de tu navegador.');
          return;
        }
      }
      
      const success = await subscribe('admin');
      if (success) {
        setShowPrompt(false);
        alert('✅ Notificaciones activadas! Recibirás alertas cuando lleguen nuevos pedidos.');
      } else {
        alert('❌ No se pudo activar las notificaciones. Por favor intenta de nuevo.');
      }
    } catch (error) {
      console.error('Error subscribing:', error);
      alert('❌ Error al activar notificaciones.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDismiss = () => {
    setShowPrompt(false);
    // Guardar en localStorage para no mostrar de nuevo en esta sesión
    localStorage.setItem('admin-notification-dismissed', Date.now().toString());
  };

  // No mostrar si:
  // - No es soportado
  // - Ya está suscrito
  // - Permiso fue denegado
  // - Ya fue dismissado hace menos de 24 horas
  if (!isSupported || isSubscribed || permission === 'denied' || !showPrompt) {
    const dismissed = localStorage.getItem('admin-notification-dismissed');
    if (dismissed && Date.now() - parseInt(dismissed) < 24 * 60 * 60 * 1000) {
      return null;
    }
    if (!isSupported || isSubscribed || permission === 'denied') {
      return null;
    }
  }

  return (
    <div className="fixed bottom-4 right-4 left-4 md:left-auto md:w-96 bg-blue-600 text-white p-4 rounded-lg shadow-lg z-50 animate-fade-in">
      <div className="flex items-start gap-3">
        <div className="flex-1">
          <h3 className="font-semibold text-sm mb-1">🔔 Activa Notificaciones</h3>
          <p className="text-xs text-blue-100 mb-3">
            Recibe alertas instantáneas cuando lleguen nuevos pedidos. Nunca perderás un pedido de vista.
          </p>
          <div className="flex gap-2">
            <button
              onClick={handleSubscribe}
              disabled={isLoading}
              className="bg-white text-blue-600 px-4 py-2 rounded text-sm font-medium hover:bg-blue-50 transition disabled:opacity-50"
            >
              {isLoading ? 'Activando...' : '✅ Activar Ahora'}
            </button>
            <button
              onClick={handleDismiss}
              className="text-blue-100 px-3 py-2 text-sm hover:text-white transition"
            >
              Después
            </button>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          className="text-blue-200 hover:text-white"
        >
          ✕
        </button>
      </div>
    </div>
  );
}
