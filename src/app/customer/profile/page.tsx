'use client';

import { useState, useEffect } from 'react';
import { useCustomerAuth } from '@/context/CustomerAuthContext';
import { useNotifications } from '@/context/NotificationsContext';
import Link from 'next/link';

export default function CustomerProfile() {
  const { customer, logout, updateProfile } = useCustomerAuth();
  const { subscribe, isSubscribed, isSupported } = useNotifications();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    address: ''
  });
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (customer) {
      setFormData({
        name: customer.name || '',
        phone: customer.phone || '',
        address: customer.address || ''
      });
    }
  }, [customer]);

  const handleSave = async () => {
    if (!customer) return;
    
    setLoading(true);
    setMessage('');
    
    try {
      const success = await updateProfile(formData);
      if (success) {
        setMessage('Perfil actualizado exitosamente');
        setIsEditing(false);
      } else {
        setMessage('Error al actualizar el perfil');
      }
    } catch (error) {
      setMessage('Error al actualizar el perfil');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    if (!customer) return;
    
    try {
      const success = await subscribe('customer', customer.id);
      if (success) {
        setMessage('Notificaciones activadas');
      } else {
        setMessage('Error al activar notificaciones');
      }
    } catch (error) {
      setMessage('Error al activar notificaciones');
    }
  };

  if (!customer) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black p-4">
        <div className="text-center">
          <h1 className="text-2xl font-light text-black dark:text-white mb-4">
            No has iniciado sesión
          </h1>
          <Link
            href="/customer/login"
            className="inline-block bg-black dark:bg-white text-white dark:text-black px-6 py-3 rounded-full font-light tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Iniciar Sesión
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black p-4">
      <div className="max-w-2xl mx-auto py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-light tracking-tight text-black dark:text-white">
              Mi Perfil
            </h1>
            <p className="text-sm text-neutral-400 dark:text-neutral-600 mt-1">
              Gestiona tu información y preferencias
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <Link
              href="/tienda"
              className="p-3 rounded-full text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined">arrow_back</span>
            </Link>
            <button
              onClick={logout}
              className="p-3 rounded-full text-neutral-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            >
              <span className="material-symbols-outlined">logout</span>
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg text-sm ${
            message.includes('exitosamente') 
              ? 'bg-green-50 dark:bg-green-900/20 text-green-600 dark:text-green-400 border border-green-200 dark:border-green-800'
              : 'bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-200 dark:border-red-800'
          }`}>
            {message}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Profile Information */}
          <div className="lg:col-span-2 space-y-6">
            <div className="border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black p-6 rounded-lg">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-light text-black dark:text-white">
                  Información Personal
                </h2>
                {!isEditing ? (
                  <button
                    onClick={() => setIsEditing(true)}
                    className="p-2 rounded-full text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                  >
                    <span className="material-symbols-outlined">edit</span>
                  </button>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="p-2 rounded-full text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                    >
                      <span className="material-symbols-outlined">close</span>
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={loading}
                      className="p-2 rounded-full bg-black dark:bg-white text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors disabled:opacity-50"
                    >
                      <span className="material-symbols-outlined">save</span>
                    </button>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                    Email
                  </label>
                  <input
                    type="email"
                    value={customer.email}
                    disabled
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-lg font-light opacity-50"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={isEditing ? formData.name : (customer.name || 'No especificado')}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-lg font-light disabled:opacity-50 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                    Teléfono
                  </label>
                  <input
                    type="tel"
                    value={isEditing ? formData.phone : (customer.phone || 'No especificado')}
                    onChange={(e) => setFormData({...formData, phone: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-lg font-light disabled:opacity-50 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>

                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">
                    Dirección
                  </label>
                  <input
                    type="text"
                    value={isEditing ? formData.address : (customer.address || 'No especificada')}
                    onChange={(e) => setFormData({...formData, address: e.target.value})}
                    disabled={!isEditing}
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-lg font-light disabled:opacity-50 focus:outline-none focus:border-black dark:focus:border-white transition-colors"
                  />
                </div>
              </div>
            </div>

            {/* Notification Preferences */}
            <div className="border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black p-6 rounded-lg">
              <h2 className="text-xl font-light text-black dark:text-white mb-6">
                Preferencias de Notificación
              </h2>

              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-neutral-50 dark:border-neutral-800">
                  <div>
                    <p className="font-medium text-black dark:text-white">Actualizaciones de pedidos</p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-600">
                      Recibir notificaciones sobre el estado de tus pedidos
                    </p>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    customer.notification_preferences.order_updates 
                      ? 'bg-green-500' 
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      customer.notification_preferences.order_updates 
                        ? 'translate-x-6' 
                        : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3 border-b border-neutral-50 dark:border-neutral-800">
                  <div>
                    <p className="font-medium text-black dark:text-white">Estado de crédito</p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-600">
                      Notificaciones sobre pagos de crédito pendientes
                    </p>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    customer.notification_preferences.credit_status 
                      ? 'bg-green-500' 
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      customer.notification_preferences.credit_status 
                        ? 'translate-x-6' 
                        : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>

                <div className="flex items-center justify-between py-3">
                  <div>
                    <p className="font-medium text-black dark:text-white">Promociones</p>
                    <p className="text-sm text-neutral-400 dark:text-neutral-600">
                      Ofertas especiales y descuentos
                    </p>
                  </div>
                  <div className={`w-12 h-6 rounded-full transition-colors ${
                    customer.notification_preferences.promotions 
                      ? 'bg-green-500' 
                      : 'bg-neutral-300 dark:bg-neutral-600'
                  }`}>
                    <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                      customer.notification_preferences.promotions 
                        ? 'translate-x-6' 
                        : 'translate-x-0.5'
                    }`} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Notifications Status */}
          <div className="space-y-6">
            <div className="border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black p-6 rounded-lg">
              <h2 className="text-xl font-light text-black dark:text-white mb-6">
                Notificaciones Push
              </h2>

              {isSupported ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between py-3">
                    <div>
                      <p className="font-medium text-black dark:text-white">Estado</p>
                      <p className="text-sm text-neutral-400 dark:text-neutral-600">
                        {isSubscribed ? 'Activadas' : 'Desactivadas'}
                      </p>
                    </div>
                    <div className={`w-12 h-6 rounded-full transition-colors ${
                      isSubscribed 
                        ? 'bg-green-500' 
                        : 'bg-neutral-300 dark:bg-neutral-600'
                    }`}>
                      <div className={`w-5 h-5 bg-white rounded-full shadow-md transform transition-transform ${
                        isSubscribed 
                          ? 'translate-x-6' 
                          : 'translate-x-0.5'
                      }`} />
                    </div>
                  </div>

                  {!isSubscribed && (
                    <button
                      onClick={handleSubscribe}
                      className="w-full bg-black dark:bg-white text-white dark:text-black py-3 rounded-full font-light tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                    >
                      Activar Notificaciones
                    </button>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <p className="text-sm text-neutral-400 dark:text-neutral-600">
                    Tu navegador no soporta notificaciones push
                  </p>
                </div>
              )}
            </div>

            {/* Account Info */}
            <div className="border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black p-6 rounded-lg">
              <h2 className="text-xl font-light text-black dark:text-white mb-6">
                Información de Cuenta
              </h2>

              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400 dark:text-neutral-600">ID de Usuario</span>
                  <span className="text-black dark:text-white font-mono">
                    {customer.id.substring(0, 8)}...
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 dark:text-neutral-600">Miembro desde</span>
                  <span className="text-black dark:text-white">
                    {new Date(customer.created_at).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400 dark:text-neutral-600">Último ingreso</span>
                  <span className="text-black dark:text-white">
                    {customer.last_login 
                      ? new Date(customer.last_login).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                      : 'Nunca'
                    }
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
