'use client';

import { useOrders } from '@/context/OrdersContext';
import { useState } from 'react';

export default function OrdersPage() {
  const { orders, updateOrderStatus, deleteOrder, getTotalSales } = useOrders();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  const filteredOrders = orders.filter(order => 
    filter === 'all' || order.status === filter
  );

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalSales: getTotalSales(),
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">Pedidos</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Gestiona los pedidos de tus clientes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatBox label="Total" value={stats.total} />
        <StatBox label="Pendientes" value={stats.pending} color="yellow" />
        <StatBox label="Completados" value={stats.completed} color="green" />
        <StatBox label="Cancelados" value={stats.cancelled} color="red" />
        <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg">
          <p className="text-sm text-neutral-600 dark:text-neutral-400">Ventas</p>
          <p className="text-xl font-bold text-green-600 dark:text-green-400">
            S/{stats.totalSales.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-2 flex-wrap">
        {(['all', 'pending', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${filter === f 
                ? 'bg-green-600 text-white' 
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700'
              }`}
          >
            {f === 'all' && 'Todos'}
            {f === 'pending' && 'Pendientes'}
            {f === 'completed' && 'Completados'}
            {f === 'cancelled' && 'Cancelados'}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700 overflow-hidden">
        {filteredOrders.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No hay pedidos {filter !== 'all' && 'con este filtro'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-neutral-50 dark:bg-neutral-700">
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Cliente
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Productos
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Total
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Fecha
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Estado
                  </th>
                  <th className="px-4 py-3 text-left text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-neutral-200 dark:divide-neutral-700">
                {filteredOrders.map((order) => (
                  <tr key={order.id} className="hover:bg-neutral-50 dark:hover:bg-neutral-700/50">
                    <td className="px-4 py-4">
                      <p className="font-medium text-black dark:text-white">{order.customerName}</p>
                      <p className="text-sm text-neutral-500 dark:text-neutral-400">{order.phone}</p>
                      <p className="text-xs text-neutral-400 dark:text-neutral-500 truncate max-w-[200px]">
                        {order.address}
                      </p>
                    </td>
                    <td className="px-4 py-4">
                      <ul className="text-sm text-neutral-600 dark:text-neutral-400 space-y-1">
                        {order.items.map((item, idx) => (
                          <li key={idx}>
                            {item.quantity}x {item.name}
                          </li>
                        ))}
                      </ul>
                    </td>
                    <td className="px-4 py-4">
                      <span className="font-semibold text-black dark:text-white">
                        S/{order.total.toFixed(2)}
                      </span>
                    </td>
                    <td className="px-4 py-4 text-sm text-neutral-600 dark:text-neutral-400">
                      {new Date(order.createdAt).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </td>
                    <td className="px-4 py-4">
                      <StatusBadge status={order.status} />
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex gap-2">
                        {order.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'completed')}
                              className="px-3 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 
                                         dark:text-green-400 rounded text-sm hover:bg-green-200 
                                         dark:hover:bg-green-900/50 transition-colors"
                            >
                              ✓ Completar
                            </button>
                            <button
                              onClick={() => updateOrderStatus(order.id, 'cancelled')}
                              className="px-3 py-1 bg-red-100 dark:bg-red-900/30 text-red-700 
                                         dark:text-red-400 rounded text-sm hover:bg-red-200 
                                         dark:hover:bg-red-900/50 transition-colors"
                            >
                              ✕ Cancelar
                            </button>
                          </>
                        )}
                        {order.status !== 'pending' && (
                          <button
                            onClick={() => updateOrderStatus(order.id, 'pending')}
                            className="px-3 py-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 
                                       dark:text-yellow-400 rounded text-sm hover:bg-yellow-200 
                                       dark:hover:bg-yellow-900/50 transition-colors"
                          >
                            ↩ Pendiente
                          </button>
                        )}
                        <button
                          onClick={() => {
                            if (confirm('¿Eliminar este pedido permanentemente?')) {
                              deleteOrder(order.id);
                            }
                          }}
                          className="px-3 py-1 text-neutral-400 hover:text-red-600 transition-colors"
                        >
                          🗑
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatBox({ 
  label, 
  value, 
  color = 'neutral' 
}: { 
  label: string; 
  value: number; 
  color?: 'neutral' | 'yellow' | 'green' | 'red';
}) {
  const colors = {
    neutral: 'bg-neutral-50 dark:bg-neutral-800',
    yellow: 'bg-yellow-50 dark:bg-yellow-900/20',
    green: 'bg-green-50 dark:bg-green-900/20',
    red: 'bg-red-50 dark:bg-red-900/20',
  };

  return (
    <div className={`${colors[color]} p-4 rounded-lg`}>
      <p className="text-sm text-neutral-600 dark:text-neutral-400">{label}</p>
      <p className="text-xl font-bold text-black dark:text-white">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400',
    completed: 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400',
    cancelled: 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400',
  };

  const labels = {
    pending: '⏳ Pendiente',
    completed: '✓ Completado',
    cancelled: '✕ Cancelado',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}
