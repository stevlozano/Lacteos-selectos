'use client';

import { useOrders } from '@/context/OrdersContext';
import { useProducts } from '@/context/ProductsContext';
import { useMemo } from 'react';

export default function DashboardPage() {
  const { orders, getTotalSales, getTodayOrders } = useOrders();
  const { products } = useProducts();

  const stats = useMemo(() => {
    const todayOrders = getTodayOrders();
    const totalSales = getTotalSales();
    const pendingOrders = orders.filter(o => o.status === 'pending').length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;
    
    const todayRevenue = todayOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);

    return {
      totalProducts: products.length,
      totalOrders: orders.length,
      pendingOrders,
      completedOrders,
      totalSales,
      todayOrders: todayOrders.length,
      todayRevenue,
    };
  }, [orders, products, getTotalSales, getTodayOrders]);

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-black dark:text-white">Dashboard</h1>
        <p className="text-neutral-600 dark:text-neutral-400 mt-1">
          Resumen de tu negocio en tiempo real
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Productos"
          value={stats.totalProducts}
          subtitle="Total disponibles"
          icon="🥛"
          color="bg-blue-500"
        />
        <StatCard
          title="Ventas Hoy"
          value={`S/${stats.todayRevenue.toFixed(2)}`}
          subtitle={`${stats.todayOrders} pedidos`}
          icon="💰"
          color="bg-green-500"
        />
        <StatCard
          title="Ventas Totales"
          value={`S/${stats.totalSales.toFixed(2)}`}
          subtitle={`${stats.completedOrders} completados`}
          icon="📈"
          color="bg-purple-500"
        />
        <StatCard
          title="Pendientes"
          value={stats.pendingOrders}
          subtitle="Por procesar"
          icon="⏳"
          color="bg-orange-500"
        />
      </div>

      {/* Recent Orders */}
      <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 dark:border-neutral-700">
        <div className="p-6 border-b border-neutral-200 dark:border-neutral-700">
          <h2 className="text-xl font-semibold text-black dark:text-white">
            Pedidos Recientes
          </h2>
        </div>
        
        {recentOrders.length === 0 ? (
          <div className="p-8 text-center text-neutral-500 dark:text-neutral-400">
            No hay pedidos aún
          </div>
        ) : (
          <div className="divide-y divide-neutral-200 dark:divide-neutral-700">
            {recentOrders.map((order) => (
              <div key={order.id} className="p-4 flex items-center justify-between">
                <div>
                  <p className="font-medium text-black dark:text-white">
                    {order.customerName}
                  </p>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400">
                    {new Date(order.createdAt).toLocaleDateString('es-PE', {
                      day: 'numeric',
                      month: 'short',
                      hour: '2-digit',
                      minute: '2-digit',
                    })} • {order.items.length} items
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-semibold text-black dark:text-white">
                    S/{order.total.toFixed(2)}
                  </span>
                  <StatusBadge status={order.status} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon, 
  color 
}: { 
  title: string; 
  value: string | number; 
  subtitle: string; 
  icon: string;
  color: string;
}) {
  return (
    <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 
                    dark:border-neutral-700 p-6">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-neutral-600 dark:text-neutral-400">
            {title}
          </p>
          <p className="text-3xl font-bold text-black dark:text-white mt-2">
            {value}
          </p>
          <p className="text-sm text-neutral-500 dark:text-neutral-500 mt-1">
            {subtitle}
          </p>
        </div>
        <div className={`w-12 h-12 ${color} rounded-lg flex items-center justify-center text-2xl`}>
          {icon}
        </div>
      </div>
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
    pending: 'Pendiente',
    completed: 'Completado',
    cancelled: 'Cancelado',
  };

  return (
    <span className={`px-3 py-1 rounded-full text-sm font-medium ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}
