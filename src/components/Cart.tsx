'use client';

import { useCart } from '@/context/CartContext';
import { useOrders } from '@/context/OrdersContext';
import { useNotifications } from '@/context/NotificationsContext';
import { useState } from 'react';
import { CartItem } from '@/types';

export function Cart() {
  const { items, removeFromCart, updateQuantity, total, itemCount, clearCart } = useCart();
  const { addOrder } = useOrders();
  const { subscribe, isSupported } = useNotifications();
  const [isOpen, setIsOpen] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    customerName: '',
    phone: '',
    address: '',
    notes: '',
    location: '',
    paymentMethod: 'efectivo' as 'yape' | 'efectivo' | 'credito',
    creditDueDate: ''
  });
  const [isGettingLocation, setIsGettingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Suscribir cliente a notificaciones (silenciosamente, sin bloquear)
    if (isSupported) {
      try {
        await subscribe('customer');
      } catch (err) {
        console.log('Notification subscription optional:', err);
      }
    }
    
    // Guardar orden en el sistema
    await addOrder({
      items: items.map(item => ({
        id: item.id,
        name: item.name,
        price: item.price,
        quantity: item.quantity,
        unit: item.unit,
      })),
      customerName: formData.customerName,
      phone: formData.phone,
      address: formData.address,
      notes: formData.notes,
      location: formData.location,
      total,
      paymentMethod: formData.paymentMethod,
      creditDueDate: formData.paymentMethod === 'credito' ? formData.creditDueDate : undefined,
    });
    
    const orderText = generateWhatsAppMessage(items, formData, total);
    const phoneNumber = '51932398293';
    const url = `https://wa.me/${phoneNumber}?text=${encodeURIComponent(orderText)}`;
    
    // Abrir WhatsApp en nueva pestaña
    window.open(url, '_blank');
    
    clearCart();
    setShowForm(false);
    setIsOpen(false);
  };

  const getCurrentLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Tu navegador no soporta geolocalización');
      return;
    }

    setIsGettingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const mapsUrl = `https://www.google.com/maps?q=${latitude},${longitude}`;
        setFormData(prev => ({ ...prev, location: mapsUrl }));
        setIsGettingLocation(false);
      },
      (error) => {
        setIsGettingLocation(false);
        switch (error.code) {
          case error.PERMISSION_DENIED:
            setLocationError('Permiso de ubicación denegado. Por favor habilita la ubicación en tu navegador.');
            break;
          case error.POSITION_UNAVAILABLE:
            setLocationError('Información de ubicación no disponible.');
            break;
          case error.TIMEOUT:
            setLocationError('Tiempo de espera agotado al obtener ubicación.');
            break;
          default:
            setLocationError('Error al obtener ubicación.');
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
    );
  };

  const generateWhatsAppMessage = (
    cartItems: CartItem[],
    customerData: { customerName: string; phone: string; address: string; notes: string; location?: string; paymentMethod: 'yape' | 'efectivo' | 'credito'; creditDueDate?: string },
    orderTotal: number
  ): string => {
    const date = new Date().toLocaleDateString('es-PE', { 
      weekday: 'long', 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });

    let message = `🥛 *NUEVO PEDIDO - LÁCTEOS*\n\n`;
    message += `📅 *Fecha:* ${date}\n\n`;
    
    message += `👤 *Cliente:*\n`;
    message += `Nombre: ${customerData.customerName}\n`;
    message += `Teléfono: ${customerData.phone}\n`;
    message += `Dirección: ${customerData.address}\n`;
    if (customerData.notes) {
      message += `Notas: ${customerData.notes}\n`;
    }
    if (customerData.location) {
      message += `📍 *Ubicación GPS:* ${customerData.location}\n`;
    }
    message += `\n`;

    message += `🛒 *Productos:*\n`;
    cartItems.forEach((item: CartItem, index: number) => {
      const subtotal = item.price * item.quantity;
      message += `${index + 1}. ${item.name}\n`;
      message += `   ${item.quantity} x S/${item.price.toFixed(2)} = S/${subtotal.toFixed(2)}\n\n`;
    });

    message += `💰 *Total: S/${orderTotal.toFixed(2)}*\n`;
    message += `💳 *Método de pago:* ${customerData.paymentMethod === 'yape' ? 'Yape' : customerData.paymentMethod === 'efectivo' ? 'Efectivo' : 'Crédito/Fiado'}\n`;
    if (customerData.paymentMethod === 'credito' && customerData.creditDueDate) {
      message += `📅 *Fecha de pago:* ${customerData.creditDueDate}\n`;
    }
    message += `\n✅ Confirmar pedido por favor`;

    return message;
  };

  if (items.length === 0) {
    return (
      <div className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800 p-6">
        <p className="text-neutral-500 dark:text-neutral-400 text-center">Tu carrito está vacío</p>
      </div>
    );
  }

  return (
    <div className="border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-800">
      <div className="border-b border-neutral-200 dark:border-neutral-700 p-4 flex items-center justify-between">
        <h2 className="text-lg font-medium dark:text-white">Carrito ({itemCount})</h2>
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="text-sm text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white"
        >
          {isOpen ? 'Ocultar' : 'Ver detalle'}
        </button>
      </div>

      {isOpen && (
        <div className="border-b border-neutral-200 dark:border-neutral-700">
          {items.map(item => (
            <div key={item.id} className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-700 p-4 last:border-b-0">
              <div className="flex-1">
                <h4 className="font-medium text-black dark:text-white">{item.name}</h4>
                <p className="text-sm text-neutral-500 dark:text-neutral-400">S/{item.price.toFixed(2)} / {item.unit}</p>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => updateQuantity(item.id, item.quantity - 1)}
                  className="flex h-8 w-8 items-center justify-center border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white"
                >
                  -
                </button>
                <span className="w-8 text-center dark:text-white">{item.quantity}</span>
                <button
                  onClick={() => updateQuantity(item.id, item.quantity + 1)}
                  className="flex h-8 w-8 items-center justify-center border border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-black hover:text-black dark:hover:border-white dark:hover:text-white"
                >
                  +
                </button>
                <button
                  onClick={() => removeFromCart(item.id)}
                  className="ml-2 text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  ×
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="p-4">
        <div className="flex justify-between mb-4">
          <span className="text-neutral-600 dark:text-neutral-400">Total</span>
          <span className="text-xl font-medium dark:text-white">S/{total.toFixed(2)}</span>
        </div>
        
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="w-full bg-black dark:bg-white py-3 text-white dark:text-black font-medium hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
          >
            Realizar Pedido
          </button>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3">
            <input
              type="text"
              placeholder="Nombre completo"
              required
              value={formData.customerName}
              onChange={e => setFormData({...formData, customerName: e.target.value})}
              className="w-full border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm focus:border-black dark:focus:border-white focus:outline-none bg-white dark:bg-neutral-700 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
            <input
              type="tel"
              placeholder="Teléfono"
              required
              value={formData.phone}
              onChange={e => setFormData({...formData, phone: e.target.value})}
              className="w-full border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm focus:border-black dark:focus:border-white focus:outline-none bg-white dark:bg-neutral-700 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
            <input
              type="text"
              placeholder="Dirección de entrega"
              required
              value={formData.address}
              onChange={e => setFormData({...formData, address: e.target.value})}
              className="w-full border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm focus:border-black dark:focus:border-white focus:outline-none bg-white dark:bg-neutral-700 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />
            <textarea
              placeholder="Notas adicionales (opcional)"
              rows={2}
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
              className="w-full border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm focus:border-black dark:focus:border-white focus:outline-none resize-none bg-white dark:bg-neutral-700 text-black dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-500"
            />

            {/* Selector de método de pago */}
            <div className="border border-neutral-300 dark:border-neutral-600 p-3 bg-white dark:bg-neutral-700">
              <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-2 uppercase tracking-wider">Método de pago</p>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'yape'})}
                  className={`py-2 px-3 text-sm border transition-all ${
                    formData.paymentMethod === 'yape'
                      ? 'bg-purple-100 border-purple-500 text-purple-700 dark:bg-purple-900/30 dark:border-purple-400 dark:text-purple-300'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-purple-300'
                  }`}
                >
                  Yape
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'efectivo'})}
                  className={`py-2 px-3 text-sm border transition-all ${
                    formData.paymentMethod === 'efectivo'
                      ? 'bg-green-100 border-green-500 text-green-700 dark:bg-green-900/30 dark:border-green-400 dark:text-green-300'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-green-300'
                  }`}
                >
                  Efectivo
                </button>
                <button
                  type="button"
                  onClick={() => setFormData({...formData, paymentMethod: 'credito'})}
                  className={`py-2 px-3 text-sm border transition-all ${
                    formData.paymentMethod === 'credito'
                      ? 'bg-orange-100 border-orange-500 text-orange-700 dark:bg-orange-900/30 dark:border-orange-400 dark:text-orange-300'
                      : 'border-neutral-300 dark:border-neutral-600 text-neutral-600 dark:text-neutral-400 hover:border-orange-300'
                  }`}
                >
                  Fiado
                </button>
              </div>

              {/* Fecha de pago para crédito */}
              {formData.paymentMethod === 'credito' && (
                <div className="mt-3 pt-3 border-t border-neutral-200 dark:border-neutral-600">
                  <label className="text-xs text-neutral-500 dark:text-neutral-400 block mb-1">
                    Fecha de pago
                  </label>
                  <input
                    type="date"
                    required={formData.paymentMethod === 'credito'}
                    value={formData.creditDueDate}
                    onChange={e => setFormData({...formData, creditDueDate: e.target.value})}
                    className="w-full border border-neutral-300 dark:border-neutral-600 px-3 py-2 text-sm focus:border-black dark:focus:border-white focus:outline-none bg-white dark:bg-neutral-700 text-black dark:text-white"
                  />
                </div>
              )}
            </div>

            {/* Botón de ubicación */}
            <div className="space-y-2">
              <button
                type="button"
                onClick={getCurrentLocation}
                disabled={isGettingLocation}
                className="w-full border border-neutral-300 dark:border-neutral-600 py-2 text-sm hover:border-black hover:bg-neutral-50 dark:hover:bg-neutral-700 flex items-center justify-center gap-2 disabled:opacity-50 dark:text-white"
              >
                {isGettingLocation ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>
                    Obteniendo ubicación...
                  </>
                ) : (
                  <>
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                    {formData.location ? 'Actualizar ubicación GPS' : 'Compartir ubicación GPS'}
                  </>
                )}
              </button>
              
              {formData.location && (
                <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30 px-3 py-2 rounded">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  <span className="truncate flex-1">Ubicación capturada</span>
                  <button
                    type="button"
                    onClick={() => setFormData({...formData, location: ''})}
                    className="text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300"
                  >
                    ×
                  </button>
                </div>
              )}
              
              {locationError && (
                <p className="text-sm text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/30 px-3 py-2 rounded">{locationError}</p>
              )}
            </div>

            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 border border-neutral-300 dark:border-neutral-600 py-2 text-sm hover:border-black dark:hover:border-white dark:text-white"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="flex-1 bg-green-600 py-2 text-sm text-white hover:bg-green-700 flex items-center justify-center gap-1"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.006c6.553 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                Enviar WhatsApp
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
