'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductCard } from '@/components/ProductCard';
import { Cart } from '@/components/Cart';
import { MobileCart } from '@/components/MobileCart';
import { useProducts } from '@/context/ProductsContext';
import { useTheme } from '@/context/ThemeContext';
import { useCustomerAuth } from '@/context/CustomerAuthContext';

interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

interface Order {
  id: string;
  items: OrderItem[];
  total: number;
  status: string;
  payment_method: string;
  created_at: string;
}

type Category = 'yogurt' | 'queso' | 'mantequilla' | 'manjar';

const categories: { id: Category | 'all'; label: string }[] = [
  { id: 'all', label: 'Todos' },
  { id: 'yogurt', label: 'Yogurts' },
  { id: 'queso', label: 'Quesos' },
  { id: 'mantequilla', label: 'Mantequilla' },
  { id: 'manjar', label: 'Manjar' },
];

export default function TiendaPage() {
  const [activeCategory, setActiveCategory] = useState<Category | 'all'>('all');
  const [mounted, setMounted] = useState(false);
  const [showHistory, setShowHistory] = useState(false);
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState(false);
  const { products } = useProducts();
  const { theme, toggleTheme } = useTheme();
  const { customer, isAuthenticated } = useCustomerAuth();

  useEffect(() => {
    const timer = setTimeout(() => setMounted(true), 0);
    return () => clearTimeout(timer);
  }, []);

  const fetchOrders = async () => {
    if (!customer?.email) return;
    
    setOrdersLoading(true);
    try {
      const response = await fetch(`/api/customer/orders?email=${encodeURIComponent(customer.email)}`);
      if (response.ok) {
        const data = await response.json();
        setOrders(data.orders || []);
      }
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setOrdersLoading(false);
    }
  };

  const openHistory = () => {
    setShowHistory(true);
    fetchOrders();
  };

  const filteredProducts = activeCategory === 'all'
    ? products
    : products.filter(p => p.category === activeCategory);

  const displayProducts = mounted ? filteredProducts : [];

  return (
    <div className="min-h-screen bg-white dark:bg-black transition-colors">
      {/* Top Navigation Bar */}
      <nav className="fixed top-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-b border-neutral-100 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-6">
              <Link 
                href="/" 
                className="text-sm font-light text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                Inicio
              </Link>
              <Link 
                href="/tienda" 
                className="text-sm font-light text-black dark:text-white"
              >
                Tienda
              </Link>
            </div>

            <div className="flex items-center gap-2">
              {/* Promociones (placeholder) */}
              <button
                className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-gradient-to-r from-orange-100 to-yellow-100 dark:from-orange-900/20 dark:to-yellow-900/20 text-sm font-light text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800"
                disabled
              >
                <span className="material-symbols-outlined text-sm">local_offer</span>
                <span className="hidden sm:inline">Promociones</span>
                <span className="hidden sm:inline text-xs bg-orange-200 dark:bg-orange-800 px-2 py-0.5 rounded-full">Próximamente</span>
              </button>

              {/* Toggle Tema */}
              <button
                onClick={toggleTheme}
                className="p-2 text-neutral-500 dark:text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                aria-label="Toggle theme"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {theme === 'dark' ? (
                    <>
                      <circle cx="12" cy="12" r="5" />
                      <line x1="12" y1="1" x2="12" y2="3" />
                      <line x1="12" y1="21" x2="12" y2="23" />
                      <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                      <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                      <line x1="1" y1="12" x2="3" y2="12" />
                      <line x1="21" y1="12" x2="23" y2="12" />
                      <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                      <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                    </>
                  ) : (
                    <>
                      <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
                    </>
                  )}
                </svg>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Bottom Navigation Bar */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white/80 dark:bg-black/80 backdrop-blur-md border-t border-neutral-100 dark:border-neutral-900">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-2">
              <Link href="/" className="flex items-center gap-2">
                <span className="text-xl font-light tracking-tight text-black dark:text-white">
                  Lácteos Selectos
                </span>
              </Link>
            </div>

            <div className="flex items-center gap-3">
              {/* Historial de Pedidos */}
              {isAuthenticated && (
                <button
                  onClick={openHistory}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-sm font-light text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">receipt_long</span>
                  <span className="hidden sm:inline">Pedidos</span>
                </button>
              )}

              {/* Perfil */}
              {isAuthenticated ? (
                <Link
                  href="/customer/profile"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-neutral-100 dark:bg-neutral-900 text-sm font-light text-neutral-700 dark:text-neutral-300 hover:bg-neutral-200 dark:hover:bg-neutral-800 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">person</span>
                  <span className="hidden sm:inline">{customer?.name || 'Mi Cuenta'}</span>
                </Link>
              ) : (
                <Link
                  href="/customer/login"
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-black dark:bg-white text-sm font-light text-white dark:text-black hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  <span className="material-symbols-outlined text-sm">login</span>
                  <span className="hidden sm:inline">Iniciar Sesión</span>
                </Link>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Header */}
      <section className="pt-32 pb-8 px-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight text-black dark:text-white">
            Hacer pedido
          </h1>
          <p className="text-sm font-light text-neutral-500 dark:text-neutral-400 mt-2">
            Selecciona los productos que deseas ordenar
          </p>
        </div>
      </section>

      {/* Products */}
      <main className="max-w-6xl mx-auto px-4 pb-24">
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 text-sm font-light rounded-full transition-all ${
                activeCategory === cat.id
                  ? 'bg-black dark:bg-white text-white dark:text-black'
                  : 'bg-neutral-100 dark:bg-neutral-900 text-neutral-600 dark:text-neutral-400 hover:bg-neutral-200 dark:hover:bg-neutral-800'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {displayProducts.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>

        {!mounted && (
          <div className="py-12 text-center">
            <div className="relative inline-block">
              <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
              <div className="absolute top-0 left-0 w-8 h-8 border-2 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
            </div>
          </div>
        )}

        {mounted && displayProducts.length === 0 && (
          <p className="text-center text-neutral-400 dark:text-neutral-600 py-12 font-light">
            No hay productos disponibles
          </p>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-100 dark:border-neutral-900 py-8 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <p className="text-xs font-light text-neutral-300 dark:text-neutral-700">
            © {new Date().getFullYear()} Lácteos Selectos
          </p>
        </div>
      </footer>

      <MobileCart />
      
      {/* Desktop Cart */}
      <div className="hidden lg:block fixed bottom-6 right-6 z-30">
        <Cart />
      </div>

      {/* Order History Modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-black w-full max-w-2xl max-h-[80vh] overflow-hidden rounded-2xl border border-neutral-100 dark:border-neutral-900 shadow-2xl">
            {/* Modal Header */}
            <div className="flex items-center justify-between p-6 border-b border-neutral-100 dark:border-neutral-900">
              <h2 className="text-xl font-light text-black dark:text-white flex items-center gap-2">
                <span className="material-symbols-outlined">receipt_long</span>
                Mis Pedidos
              </h2>
              <button
                onClick={() => setShowHistory(false)}
                className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 overflow-y-auto max-h-[60vh]">
              {ordersLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="relative">
                    <div className="w-8 h-8 border-2 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
                    <div className="absolute top-0 left-0 w-8 h-8 border-2 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
                  </div>
                </div>
              ) : orders.length === 0 ? (
                <div className="text-center py-12">
                  <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 mb-4">inbox</span>
                  <p className="text-sm text-neutral-400 dark:text-neutral-600">
                    No tienes pedidos registrados
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {orders.map((order) => (
                    <div
                      key={order.id}
                      className="border border-neutral-100 dark:border-neutral-800 p-4 rounded-xl hover:border-neutral-200 dark:hover:border-neutral-700 transition-colors"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-black dark:text-white">
                          Pedido #{order.id.substring(0, 8)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          order.status === 'completed' 
                            ? 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                            : order.status === 'pending'
                            ? 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-600 dark:text-yellow-400'
                            : order.status === 'cancelled'
                            ? 'bg-red-100 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                            : 'bg-neutral-100 dark:bg-neutral-800 text-neutral-600 dark:text-neutral-400'
                        }`}>
                          {order.status === 'completed' ? 'Completado'
                            : order.status === 'pending' ? 'Pendiente'
                            : order.status === 'cancelled' ? 'Cancelado'
                            : order.status}
                        </span>
                      </div>
                      <p className="text-xs text-neutral-400 dark:text-neutral-600 mb-2">
                        {new Date(order.created_at).toLocaleDateString('es-PE', {
                          day: 'numeric',
                          month: 'short',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit'
                        })}
                      </p>
                      <div className="space-y-1 mb-3">
                        {order.items.slice(0, 3).map((item: OrderItem, idx: number) => (
                          <p key={idx} className="text-sm text-neutral-600 dark:text-neutral-400">
                            • {item.name} x {item.quantity}
                          </p>
                        ))}
                        {order.items.length > 3 && (
                          <p className="text-xs text-neutral-400 dark:text-neutral-600">
                            + {order.items.length - 3} productos más
                          </p>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-neutral-100 dark:border-neutral-800">
                        <span className="text-sm font-medium text-black dark:text-white">
                          Total: S/{order.total.toFixed(2)}
                        </span>
                        <span className={`text-xs px-2 py-1 rounded ${
                          order.payment_method === 'yape'
                            ? 'bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400'
                            : order.payment_method === 'credito'
                            ? 'bg-orange-100 dark:bg-orange-900/20 text-orange-600 dark:text-orange-400'
                            : 'bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400'
                        }`}>
                          {order.payment_method === 'yape' ? 'Yape'
                            : order.payment_method === 'credito' ? 'Crédito'
                            : 'Efectivo'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
