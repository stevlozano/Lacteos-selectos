'use client';

import { useState, useEffect } from 'react';
import { useNotifications } from '@/context/NotificationsContext';
import { useOrders } from '@/context/OrdersContext';

export function AdminNotifications() {
  const { isSupported, isSubscribed, subscribe, unsubscribe } = useNotifications();
  const { orders } = useOrders();
  const [isSubscribing, setIsSubscribing] = useState(false);
  const [pendingOrders, setPendingOrders] = useState(0);

  useEffect(() => {
    setPendingOrders(orders.filter(o => o.status === 'pending').length);
  }, [orders]);

  const handleSubscribe = async () => {
    setIsSubscribing(true);
    try {
      await subscribe('admin');
    } finally {
      setIsSubscribing(false);
    }
  };

  if (!isSupported) {
    return (
      <div className="p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <p className="text-sm text-neutral-600 dark:text-neutral-400">
          Las notificaciones no son soportadas en este navegador.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Subscription Status */}
      <div className="flex items-center justify-between p-4 bg-neutral-100 dark:bg-neutral-800 rounded-lg">
        <div>
          <h3 className="font-medium text-neutral-900 dark:text-white">Notificaciones Push</h3>
          <p className="text-sm text-neutral-600 dark:text-neutral-400">
            {isSubscribed 
              ? 'Recibirás notificaciones de nuevos pedidos' 
              : 'Activa para recibir notificaciones de nuevos pedidos'}
          </p>
        </div>
        <button
          onClick={isSubscribed ? unsubscribe : handleSubscribe}
          disabled={isSubscribing}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isSubscribed
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-black text-white hover:bg-neutral-800 dark:bg-white dark:text-black dark:hover:bg-neutral-200'
          }`}
        >
          {isSubscribing ? 'Configurando...' : isSubscribed ? 'Desactivar' : 'Activar'}
        </button>
      </div>

      {/* Pending Orders Alert */}
      {pendingOrders > 0 && (
        <div className="p-4 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
          <div className="flex items-center gap-2">
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500"></span>
            </span>
            <p className="text-sm font-medium text-orange-800 dark:text-orange-200">
              {pendingOrders} pedido{pendingOrders > 1 ? 's' : ''} pendiente{pendingOrders > 1 ? 's' : ''} de aprobación
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
