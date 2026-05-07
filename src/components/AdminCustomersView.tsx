'use client';

import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { PersonIcon, CalendarIcon, LogoutIcon } from '@/components/Icons';

interface Customer {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  address?: string;
  is_active: boolean;
  created_at: string;
  last_login?: string;
  notification_preferences: {
    order_updates: boolean;
    credit_status: boolean;
    promotions: boolean;
  };
}

interface ActivityLog {
  id: string;
  customer_id: string;
  activity_type: 'login' | 'logout' | 'register';
  timestamp: string;
  ip_address?: string;
  user_agent?: string;
  customer?: {
    id: string;
    email: string;
    name?: string;
  };
}

export function AdminCustomersView() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [showActivityModal, setShowActivityModal] = useState(false);

  useEffect(() => {
    fetchCustomers();
    fetchActivityLogs();
  }, []);

  const fetchCustomers = async () => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setCustomers(data || []);
    } catch (error) {
      console.error('Error fetching customers:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchActivityLogs = async () => {
    try {
      const { data, error } = await supabase
        .from('user_activity_log')
        .select(`
          *,
          customer:customers(id, email, name)
        `)
        .order('timestamp', { ascending: false })
        .limit(50);

      if (error) throw error;
      setActivityLogs(data || []);
    } catch (error) {
      console.error('Error fetching activity logs:', error);
    }
  };

  const toggleCustomerStatus = async (customerId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('customers')
        .update({ is_active: !currentStatus })
        .eq('id', customerId);

      if (error) throw error;
      fetchCustomers();
    } catch (error) {
      console.error('Error toggling customer status:', error);
    }
  };

  const viewCustomerActivity = (customer: Customer) => {
    setSelectedCustomer(customer);
    setShowActivityModal(true);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-PE', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'login':
        return <span className="text-green-600">🔑</span>;
      case 'logout':
        return <LogoutIcon size={16} className="text-red-600" />;
      case 'register':
        return <PersonIcon size={16} className="text-blue-600" />;
      default:
        return <PersonIcon size={16} className="text-neutral-400" />;
    }
  };

  const getActivityLabel = (type: string) => {
    switch (type) {
      case 'login':
        return 'Ingreso';
      case 'logout':
        return 'Salida';
      case 'register':
        return 'Registro';
      default:
        return type;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="relative">
          <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-8 h-8 border-2 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-xl lg:text-2xl font-extralight tracking-tight text-black dark:text-white mb-6">
          Clientes Registrados
        </h2>
        
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
            <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-2">
              Total Clientes
            </p>
            <p className="text-2xl font-extralight text-black dark:text-white">
              {customers.length}
            </p>
          </div>
          <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
            <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-2">
              Activos
            </p>
            <p className="text-2xl font-extralight text-green-600 dark:text-green-400">
              {customers.filter(c => c.is_active).length}
            </p>
          </div>
          <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
            <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-2">
              Inactivos
            </p>
            <p className="text-2xl font-extralight text-red-600 dark:text-red-400">
              {customers.filter(c => !c.is_active).length}
            </p>
          </div>
        </div>

        {/* Customers Table */}
        {customers.length === 0 ? (
          <div className="py-12 text-center border border-neutral-100 dark:border-neutral-900">
            <PersonIcon size={40} className="text-neutral-300 dark:text-neutral-700 mb-4" />
            <p className="text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              No hay clientes registrados
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-neutral-100 dark:border-neutral-900">
                  <th className="text-left py-3 px-4 text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                    Cliente
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                    Contacto
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                    Registro
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                    Último Ingreso
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                    Estado
                  </th>
                  <th className="text-left py-3 px-4 text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
                    Acciones
                  </th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.id} className="border-b border-neutral-50 dark:border-neutral-900">
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-light text-black dark:text-white">
                          {customer.name || 'Sin nombre'}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-600">
                          ID: {customer.id.substring(0, 8)}...
                        </p>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <div>
                        <p className="font-light text-black dark:text-white text-sm">
                          {customer.email}
                        </p>
                        {customer.phone && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-600">
                            {customer.phone}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-light text-neutral-600 dark:text-neutral-400">
                        {formatDate(customer.created_at)}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <p className="text-sm font-light text-neutral-600 dark:text-neutral-400">
                        {customer.last_login ? formatDate(customer.last_login) : 'Nunca'}
                      </p>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-light ${
                          customer.is_active
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          customer.is_active ? 'bg-green-600 dark:bg-green-400' : 'bg-red-600 dark:bg-red-400'
                        }`} />
                        {customer.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => viewCustomerActivity(customer)}
                          className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                          title="Ver actividad"
                        >
                          <CalendarIcon size={16} />
                        </button>
                        <button
                          onClick={() => toggleCustomerStatus(customer.id, customer.is_active)}
                          className={`p-2 transition-colors ${
                            customer.is_active
                              ? 'text-neutral-400 hover:text-red-600 dark:hover:text-red-400'
                              : 'text-neutral-400 hover:text-green-600 dark:hover:text-green-400'
                          }`}
                          title={customer.is_active ? 'Desactivar' : 'Activar'}
                        >
                          {customer.is_active ? '🔴' : '🟢'}
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

      {/* Recent Activity */}
      <div>
        <h3 className="text-lg font-extralight tracking-tight text-black dark:text-white mb-4">
          Actividad Reciente
        </h3>
        
        {activityLogs.length === 0 ? (
          <div className="py-8 text-center border border-neutral-100 dark:border-neutral-900">
            <p className="text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              No hay actividad reciente
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {activityLogs.slice(0, 10).map((log) => (
              <div
                key={log.id}
                className="flex items-center justify-between py-3 px-4 border border-neutral-50 dark:border-neutral-900"
              >
                <div className="flex items-center gap-3">
                  {getActivityIcon(log.activity_type)}
                  <div>
                    <p className="text-sm font-light text-black dark:text-white">
                      {log.customer?.name || log.customer?.email || 'Usuario desconocido'}
                    </p>
                    <p className="text-xs text-neutral-400 dark:text-neutral-600">
                      {getActivityLabel(log.activity_type)}
                    </p>
                  </div>
                </div>
                <p className="text-xs font-light text-neutral-500 dark:text-neutral-500">
                  {formatDate(log.timestamp)}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Activity Modal */}
      {showActivityModal && selectedCustomer && (
        <div className="fixed inset-0 bg-white/95 dark:bg-black/95 flex items-center justify-center p-4 lg:p-6 z-50">
          <div className="w-full max-w-2xl max-h-[90vh] overflow-auto border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-extralight tracking-tight text-black dark:text-white">
                  Actividad de {selectedCustomer.name || selectedCustomer.email}
                </h2>
                <button
                  onClick={() => setShowActivityModal(false)}
                  className="p-2 text-neutral-400 hover:text-black dark:hover:text-white"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-4">
                {activityLogs
                  .filter(log => log.customer_id === selectedCustomer.id)
                  .map((log) => (
                    <div
                      key={log.id}
                      className="flex items-center justify-between py-3 px-4 border border-neutral-50 dark:border-neutral-900"
                    >
                      <div className="flex items-center gap-3">
                        {getActivityIcon(log.activity_type)}
                        <div>
                          <p className="text-sm font-light text-black dark:text-white">
                            {getActivityLabel(log.activity_type)}
                          </p>
                          {log.ip_address && (
                            <p className="text-xs text-neutral-400 dark:text-neutral-600">
                              IP: {log.ip_address}
                            </p>
                          )}
                        </div>
                      </div>
                      <p className="text-xs font-light text-neutral-500 dark:text-neutral-500">
                        {formatDate(log.timestamp)}
                      </p>
                    </div>
                  ))}
                
                {activityLogs.filter(log => log.customer_id === selectedCustomer.id).length === 0 && (
                  <div className="py-8 text-center">
                    <p className="text-sm font-light text-neutral-400 dark:text-neutral-600">
                      No hay actividad registrada para este cliente
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
