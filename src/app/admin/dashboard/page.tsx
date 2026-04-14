'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useOrders } from '@/context/OrdersContext';
import { useProducts } from '@/context/ProductsContext';
import { Product } from '@/types';

type Category = 'yogurt' | 'queso' | 'mantequilla' | 'manjar';
type FilterCategory = Category | 'all';
type View = 'dashboard' | 'products' | 'orders';

export default function AdminPage() {
  const { isAuthenticated, logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  const navItems = [
    { id: 'dashboard' as View, label: 'Dashboard', icon: 'space_dashboard' },
    { id: 'products' as View, label: 'Productos', icon: 'inventory_2' },
    { id: 'orders' as View, label: 'Pedidos', icon: 'receipt_long' },
  ];

  return (
    <div className="min-h-screen bg-white dark:bg-black flex">
      {/* Sidebar - Solo Desktop */}
      <aside className="hidden lg:flex flex-col w-72 bg-white dark:bg-black border-r border-neutral-100 dark:border-neutral-900 h-screen sticky top-0">
        <div className="p-8">
          <h1 className="text-2xl font-extralight tracking-tight text-black dark:text-white">
            Lácteos
          </h1>
          <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-1 uppercase tracking-widest">
            Panel Admin
          </p>
          <div className="mt-6 pt-6 border-t border-neutral-100 dark:border-neutral-900">
            <p className="text-sm font-light text-neutral-600 dark:text-neutral-400">{user?.email}</p>
          </div>
        </div>

        <nav className="px-4 py-4 flex-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`w-full group flex items-center gap-4 px-6 py-4 mx-2 rounded-full transition-all duration-300
                ${currentView === item.id
                  ? 'bg-black dark:bg-white text-white dark:text-black' 
                  : 'text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
                }`}
            >
              <span className="material-symbols-outlined text-xl">{item.icon}</span>
              <span className="text-sm font-light tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-neutral-100 dark:border-neutral-900">
          <button
            onClick={toggleTheme}
            className="w-full flex items-center gap-4 px-6 py-4 rounded-full text-neutral-400 
                       hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
          >
            <span className="material-symbols-outlined text-xl">
              {theme === 'dark' ? 'light_mode' : 'dark_mode'}
            </span>
            <span className="text-sm font-light tracking-wide">
              {theme === 'dark' ? 'Claro' : 'Oscuro'}
            </span>
          </button>
          
          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="w-full flex items-center gap-4 px-6 py-4 mt-2 rounded-full text-neutral-400 
                       hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
          >
            <span className="material-symbols-outlined text-xl">logout</span>
            <span className="text-sm font-light tracking-wide">Salir</span>
          </button>

          <Link
            href="/"
            className="w-full flex items-center gap-4 px-6 py-4 mt-2 rounded-full text-neutral-400 
                       hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
          >
            <span className="material-symbols-outlined text-xl">storefront</span>
            <span className="text-sm font-light tracking-wide">Tienda</span>
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 p-4 lg:p-12 pb-24 lg:pb-12 pt-16 lg:pt-12 overflow-auto">
        {currentView === 'dashboard' && <DashboardView />}
        {currentView === 'products' && <ProductsView />}
        {currentView === 'orders' && <OrdersView />}
      </main>

      {/* Bottom Navigation Bar - Mobile (estilo WhatsApp) */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 bg-white dark:bg-black border-t border-neutral-100 dark:border-neutral-900 z-50">
        <div className="flex items-center justify-around">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setCurrentView(item.id)}
              className={`flex flex-col items-center py-3 px-4 flex-1 transition-colors
                ${currentView === item.id
                  ? 'text-black dark:text-white'
                  : 'text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300'
                }`}
            >
              <span className={`material-symbols-outlined text-2xl ${currentView === item.id ? 'fill' : ''}`}>
                {item.icon}
              </span>
              <span className="text-[10px] font-light tracking-wide mt-1">{item.label}</span>
              {currentView === item.id && (
                <span className="absolute bottom-0 w-12 h-0.5 bg-black dark:bg-white rounded-t-full" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}

// Dashboard View Component
function DashboardView() {
  const { orders, getTotalSales, getTodayOrders } = useOrders();
  const { products } = useProducts();

  const stats = {
    totalProducts: products.length,
    totalOrders: orders.length,
    pendingOrders: orders.filter(o => o.status === 'pending').length,
    completedOrders: orders.filter(o => o.status === 'completed').length,
    todayOrders: getTodayOrders().length,
    todayRevenue: getTodayOrders()
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0),
    totalSales: getTotalSales(),
  };

  const recentOrders = orders.slice(0, 5);

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl lg:text-4xl font-extralight tracking-tight text-black dark:text-white">Dashboard</h1>
        <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-2 uppercase tracking-widest">
          Resumen del negocio
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
        <StatCard title="Productos" value={stats.totalProducts} subtitle="En catálogo" icon="inventory_2" />
        <StatCard title="Hoy" value={`S/${stats.todayRevenue.toFixed(2)}`} subtitle={`${stats.todayOrders} pedidos`} icon="today" />
        <StatCard title="Total Ventas" value={`S/${stats.totalSales.toFixed(2)}`} subtitle={`${stats.completedOrders} completados`} icon="payments" />
        <StatCard title="Pendientes" value={stats.pendingOrders} subtitle="Por procesar" icon="pending_actions" />
      </div>

      {/* Recent Orders */}
      <div>
        <h2 className="text-xl lg:text-2xl font-extralight tracking-tight text-black dark:text-white mb-6">
          Pedidos Recientes
        </h2>
        
        {recentOrders.length === 0 ? (
          <div className="py-12 text-center border border-neutral-100 dark:border-neutral-900">
            <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 mb-4">inbox</span>
            <p className="text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              No hay pedidos aún
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentOrders.map((order) => (
              <div 
                key={order.id} 
                className="flex flex-col lg:flex-row lg:items-center justify-between py-4 border-b border-neutral-100 dark:border-neutral-900 gap-4"
              >
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center flex-shrink-0">
                    <span className="material-symbols-outlined text-neutral-400">person</span>
                  </div>
                  <div>
                    <p className="font-light text-black dark:text-white">{order.customerName}</p>
                    <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-1">
                      {new Date(order.createdAt).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })} · {order.items.length} items
                    </p>
                  </div>
                </div>
                <div className="flex items-center justify-between lg:justify-end gap-4 lg:gap-6">
                  <span className="text-sm font-light text-black dark:text-white">
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

// Products View Component
function ProductsView() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    unit: '',
    category: 'yogurt' as Category,
    image: '',
  });

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const categoryLabels: Record<FilterCategory, string> = {
    all: 'Todos',
    yogurt: 'Yogurts',
    queso: 'Quesos',
    mantequilla: 'Mantequilla',
    manjar: 'Manjar',
  };

  const categoryIcons: Record<FilterCategory, string> = {
    all: 'inventory_2',
    yogurt: 'local_drink',
    queso: 'kitchen',
    mantequilla: 'egg_alt',
    manjar: 'cookie',
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const productData = {
      name: formData.name,
      description: formData.description,
      price: parseFloat(formData.price),
      unit: formData.unit,
      category: formData.category,
      image: formData.image || undefined,
    };

    if (editingProduct) {
      updateProduct(editingProduct.id, productData);
    } else {
      addProduct(productData);
    }
    closeModal();
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        description: product.description,
        price: product.price.toString(),
        unit: product.unit,
        category: product.category,
        image: product.image || '',
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', description: '', price: '', unit: '', category: 'yogurt', image: '' });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extralight tracking-tight text-black dark:text-white">Productos</h1>
          <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-2 uppercase tracking-widest">
            Gestiona tu catálogo
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-black dark:bg-white text-white dark:text-black px-6 py-3 
                     font-light tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200
                     transition-colors self-start lg:self-auto flex items-center gap-2"
        >
          <span className="material-symbols-outlined">add</span>
          <span>Nuevo</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 lg:gap-3 border-b border-neutral-100 dark:border-neutral-900 pb-4 lg:pb-6">
        {(['all', 'yogurt', 'queso', 'mantequilla', 'manjar'] as FilterCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 lg:px-5 py-2 text-sm font-light tracking-wide transition-all
              ${activeCategory === cat 
                ? 'bg-black dark:bg-white text-white dark:text-black' 
                : 'text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
          >
            <span className="material-symbols-outlined text-base">{categoryIcons[cat]}</span>
            <span className="hidden sm:inline">{categoryLabels[cat]}</span>
            <span className={`ml-1 lg:ml-2 text-xs ${activeCategory === cat ? 'opacity-70' : 'text-neutral-300 dark:text-neutral-600'}`}>
              {cat === 'all' ? products.length : products.filter(p => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 lg:gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full py-16 text-center border border-neutral-100 dark:border-neutral-900">
            <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 mb-4">inventory_2</span>
            <p className="text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              No hay productos
            </p>
            <button
              onClick={() => openModal()}
              className="mt-6 text-xs font-light text-neutral-400 hover:text-black dark:hover:text-white transition-colors uppercase tracking-widest"
            >
              + Agregar producto
            </button>
          </div>
        ) : filteredProducts.map((product) => (
          <div
            key={product.id}
            className="group border border-neutral-100 dark:border-neutral-900 hover:border-neutral-200 dark:hover:border-neutral-800 transition-all"
          >
            {product.image && (
              <div className="h-40 lg:h-48 bg-neutral-50 dark:bg-neutral-900 overflow-hidden">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                />
              </div>
            )}
            <div className="p-4 lg:p-5">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-1">
                    {product.category}
                  </p>
                  <h3 className="font-light text-base lg:text-lg text-black dark:text-white">
                    {product.name}
                  </h3>
                </div>
                <span className="font-light text-lg lg:text-xl text-black dark:text-white">
                  S/{product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm font-light text-neutral-500 dark:text-neutral-500 line-clamp-2 mb-4">
                {product.description}
              </p>
              <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mb-4">
                Por {product.unit}
              </p>
              
              <div className="flex gap-3 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 py-2 text-xs font-light text-neutral-500 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-sm mr-1 align-text-bottom">edit</span>
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar este producto?')) deleteProduct(product.id); }}
                  className="flex-1 py-2 text-xs font-light text-neutral-400 hover:text-red-600 dark:text-neutral-600 dark:hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                  <span className="material-symbols-outlined text-sm mr-1 align-text-bottom">delete</span>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-white/95 dark:bg-black/95 flex items-center justify-center p-4 lg:p-6 z-50">
          <div className="w-full max-w-lg max-h-[90vh] overflow-auto border border-neutral-100 dark:border-neutral-900 bg-white dark:bg-black">
            <div className="p-6 lg:p-8">
              <div className="flex items-center justify-between mb-8">
                <h2 className="text-2xl font-extralight tracking-tight text-black dark:text-white">
                  {editingProduct ? 'Editar' : 'Nuevo'}
                </h2>
                <button onClick={closeModal} className="p-2 text-neutral-400 hover:text-black dark:hover:text-white">
                  <span className="material-symbols-outlined">close</span>
                </button>
              </div>
              
              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">Nombre</label>
                  <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-lg font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">Descripción</label>
                  <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required rows={2}
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-base font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors resize-none" />
                </div>
                <div className="grid grid-cols-2 gap-4 lg:gap-6">
                  <div>
                    <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">Precio (S/)</label>
                    <input type="number" step="0.01" value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} required
                      className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-lg font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                  </div>
                  <div>
                    <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">Unidad</label>
                    <input type="text" value={formData.unit} onChange={(e) => setFormData({ ...formData, unit: e.target.value })} required placeholder="Litro, 500g"
                      className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-lg font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">Categoría</label>
                  <select value={formData.category} onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-base font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer">
                    <option value="yogurt">Yogurt</option>
                    <option value="queso">Queso</option>
                    <option value="mantequilla">Mantequilla</option>
                    <option value="manjar">Manjar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-light text-neutral-400 dark:text-neutral-600 mb-2 uppercase tracking-widest">URL Imagen (opcional)</label>
                  <input type="url" value={formData.image} onChange={(e) => setFormData({ ...formData, image: e.target.value })} placeholder="https://..."
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-base font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors" />
                </div>
                <div className="flex gap-4 pt-8">
                  <button type="button" onClick={closeModal}
                    className="flex-1 py-4 text-sm font-light text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors uppercase tracking-wider border border-neutral-100 dark:border-neutral-900">
                    Cancelar
                  </button>
                  <button type="submit"
                    className="flex-1 bg-black dark:bg-white text-white dark:text-black py-4 font-light tracking-wide hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors">
                    {editingProduct ? 'Guardar' : 'Crear'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Orders View Component
function OrdersView() {
  const { orders, updateOrderStatus, deleteOrder, getTotalSales } = useOrders();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');

  const filteredOrders = orders.filter(order => filter === 'all' || order.status === filter);

  const stats = {
    total: orders.length,
    pending: orders.filter(o => o.status === 'pending').length,
    completed: orders.filter(o => o.status === 'completed').length,
    cancelled: orders.filter(o => o.status === 'cancelled').length,
    totalSales: getTotalSales(),
  };

  const filterIcons = {
    all: 'receipt_long',
    pending: 'pending_actions',
    completed: 'check_circle',
    cancelled: 'cancel',
  };

  const filterLabels = {
    all: 'Todos',
    pending: 'Pendientes',
    completed: 'Completados',
    cancelled: 'Cancelados',
  };

  return (
    <div className="space-y-8 lg:space-y-10">
      <div>
        <h1 className="text-3xl lg:text-4xl font-extralight tracking-tight text-black dark:text-white">Pedidos</h1>
        <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-2 uppercase tracking-widest">
          Gestiona las órdenes
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 lg:gap-6">
        <StatBox label="Total" value={stats.total} icon="receipt_long" />
        <StatBox label="Pendientes" value={stats.pending} icon="pending_actions" />
        <StatBox label="Completados" value={stats.completed} icon="check_circle" />
        <StatBox label="Cancelados" value={stats.cancelled} icon="cancel" />
        <div className="col-span-2 lg:col-span-1 border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
          <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-2">Ventas</p>
          <p className="text-xl lg:text-2xl font-extralight text-black dark:text-white">
            S/{stats.totalSales.toFixed(2)}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2 lg:gap-3 border-b border-neutral-100 dark:border-neutral-900 pb-4 lg:pb-6">
        {(['all', 'pending', 'completed', 'cancelled'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`flex items-center gap-2 px-4 lg:px-5 py-2 text-sm font-light tracking-wide transition-all
              ${filter === f 
                ? 'bg-black dark:bg-white text-white dark:text-black' 
                : 'text-neutral-400 hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900'
              }`}
          >
            <span className="material-symbols-outlined text-base">{filterIcons[f]}</span>
            <span className="hidden sm:inline">{filterLabels[f]}</span>
            <span className={`ml-1 lg:ml-2 text-xs ${filter === f ? 'opacity-70' : 'text-neutral-300 dark:text-neutral-600'}`}>
              {f === 'all' ? orders.length : orders.filter(o => o.status === f).length}
            </span>
          </button>
        ))}
      </div>

      {/* Orders List */}
      <div>
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center border border-neutral-100 dark:border-neutral-900">
            <span className="material-symbols-outlined text-4xl text-neutral-300 dark:text-neutral-700 mb-4">inbox</span>
            <p className="text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              No hay pedidos {filter !== 'all' && 'con este filtro'}
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6 hover:border-neutral-200 dark:hover:border-neutral-800 transition-all"
              >
                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-4">
                  <div className="flex items-start gap-3 lg:gap-4">
                    <div className="w-10 h-10 lg:w-12 lg:h-12 rounded-full bg-neutral-50 dark:bg-neutral-900 flex items-center justify-center flex-shrink-0">
                      <span className="material-symbols-outlined text-neutral-400">person</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-light text-black dark:text-white truncate">{order.customerName}</p>
                      <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-1">{order.phone}</p>
                      <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 truncate">
                        {order.address}
                      </p>
                      <div className="mt-3 space-y-1">
                        {order.items.map((item, idx) => (
                          <p key={idx} className="text-xs font-light text-neutral-500 dark:text-neutral-500">
                            {item.quantity}x {item.name}
                          </p>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex lg:flex-col items-center lg:items-end justify-between lg:justify-start gap-2 lg:gap-1">
                    <p className="text-lg lg:text-xl font-extralight text-black dark:text-white">
                      S/{order.total.toFixed(2)}
                    </p>
                    <p className="text-xs font-light text-neutral-400 dark:text-neutral-600">
                      {new Date(order.createdAt).toLocaleDateString('es-PE', {
                        day: 'numeric',
                        month: 'short',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    <div className="lg:mt-2">
                      <StatusBadge status={order.status} />
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:gap-4 mt-4 lg:mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                  {order.status === 'pending' && (
                    <>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex-1 lg:flex-none py-2 px-4 text-xs font-light text-neutral-500 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">check</span>
                        Completar
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="flex-1 lg:flex-none py-2 px-4 text-xs font-light text-neutral-400 hover:text-red-600 dark:text-neutral-600 dark:hover:text-red-400 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                        Cancelar
                      </button>
                    </>
                  )}
                  {order.status !== 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      className="flex-1 lg:flex-none py-2 px-4 text-xs font-light text-neutral-400 hover:text-black dark:text-neutral-600 dark:hover:text-white transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <span className="material-symbols-outlined text-sm">refresh</span>
                      Marcar Pendiente
                    </button>
                  )}
                  <button
                    onClick={() => { if (confirm('¿Eliminar este pedido?')) deleteOrder(order.id); }}
                    className="py-2 px-4 text-neutral-400 hover:text-red-600 dark:text-neutral-600 dark:hover:text-red-400 transition-colors"
                  >
                    <span className="material-symbols-outlined text-sm">delete</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// Shared Components
function StatCard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon: string }) {
  return (
    <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
      <span className="material-symbols-outlined text-xl text-neutral-300 dark:text-neutral-700 mb-2 lg:mb-3">{icon}</span>
      <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl lg:text-3xl font-extralight text-black dark:text-white mt-1 lg:mt-2">{value}</p>
      <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-1 lg:mt-2">{subtitle}</p>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
      <span className="material-symbols-outlined text-xl text-neutral-300 dark:text-neutral-700 mb-2 lg:mb-3">{icon}</span>
      <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest mb-1">{label}</p>
      <p className="text-xl lg:text-2xl font-extralight text-black dark:text-white mt-1 lg:mt-2">{value}</p>
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const styles = {
    pending: 'border border-neutral-200 dark:border-neutral-800 text-neutral-500 dark:text-neutral-500',
    completed: 'border border-black dark:border-white text-black dark:text-white',
    cancelled: 'border border-neutral-100 dark:border-neutral-900 text-neutral-300 dark:text-neutral-700',
  };
  const labels = { pending: 'Pendiente', completed: 'Completado', cancelled: 'Cancelado' };
  return (
    <span className={`px-2 lg:px-3 py-1 text-xs font-light tracking-wider uppercase ${styles[status as keyof typeof styles]}`}>
      {labels[status as keyof typeof labels]}
    </span>
  );
}

// ...
