'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useOrders } from '@/context/OrdersContext';
import { useProducts } from '@/context/ProductsContext';
import { Product } from '@/types';
import { DashboardIcon, ProductsIcon, OrdersIcon, StoreIcon, SunIcon, MoonIcon, LogoutIcon, InboxIcon, PersonIcon, AddIcon, DrinkIcon, KitchenIcon, EggIcon, CookieIcon, TodayIcon, PaymentsIcon, PendingActionsIcon, CheckIcon, CloseIcon, RefreshIcon, DeleteIcon, EditIcon, CheckCircleIcon, CancelIcon, ReceiptIcon, InventoryIcon, PendingIcon, CalendarIcon, NotificationsIcon, TruckIcon } from '@/components/Icons';
import { AdminNotifications } from '@/components/AdminNotifications';
import { supabase } from '@/lib/supabase';

type Category = 'yogurt' | 'queso' | 'mantequilla' | 'manjar';
type FilterCategory = Category | 'all';
type View = 'dashboard' | 'products' | 'orders';

export default function AdminPage() {
  const { isAuthenticated, logout, user, loading: authLoading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const router = useRouter();
  const [currentView, setCurrentView] = useState<View>('dashboard');

  useEffect(() => {
    // Solo redirigir si no está cargando y no está autenticado
    if (!authLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isAuthenticated, authLoading, router]);

  // Mostrar loading mientras auth está cargando
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-black">
        <div className="relative">
          <div className="w-12 h-12 border-2 border-neutral-200 dark:border-neutral-800 rounded-full"></div>
          <div className="absolute top-0 left-0 w-12 h-12 border-2 border-black dark:border-white rounded-full border-t-transparent animate-spin"></div>
        </div>
      </div>
    );
  }

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
              {item.icon === 'space_dashboard' && <DashboardIcon size={20} className="opacity-70" />}
              {item.icon === 'inventory_2' && <InventoryIcon size={20} className="opacity-70" />}
              {item.icon === 'receipt_long' && <ReceiptIcon size={20} className="opacity-70" />}
              <span className="text-sm font-light tracking-wide">{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="p-6 border-t border-neutral-100 dark:border-neutral-900">
          <Link
            href="/"
            className="w-full flex items-center gap-4 px-6 py-4 rounded-full text-neutral-400 
                       hover:text-black dark:hover:text-white hover:bg-neutral-50 dark:hover:bg-neutral-900 transition-all"
          >
            <StoreIcon size={20} className="opacity-70" />
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
              {item.icon === 'space_dashboard' && <DashboardIcon size={24} />}
              {item.icon === 'inventory_2' && <InventoryIcon size={24} />}
              {item.icon === 'receipt_long' && <ReceiptIcon size={24} />}
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
  const { theme, toggleTheme } = useTheme();
  const { logout } = useAuth();
  const router = useRouter();

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
      {/* Header con título y botones de acción */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-3xl lg:text-4xl font-extralight tracking-tight text-black dark:text-white">Dashboard</h1>
          <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 mt-2 uppercase tracking-widest">
            Resumen del negocio
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={toggleTheme}
            className="p-3 rounded-full text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors"
            aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          >
            {theme === 'dark' ? <SunIcon size={20} /> : <MoonIcon size={20} />}
          </button>
          <button
            onClick={() => {
              logout();
              router.push('/admin/login');
            }}
            className="p-3 rounded-full text-neutral-400 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors"
            aria-label="Cerrar sesión"
          >
            <LogoutIcon size={20} />
          </button>
        </div>
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
            <InboxIcon size={40} className="text-neutral-300 dark:text-neutral-700 mb-4" />
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
                    <PersonIcon size={20} className="text-neutral-400" />
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
          <AddIcon size={20} />
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
            {cat === 'all' && <InventoryIcon size={16} />}
            {cat === 'yogurt' && <DrinkIcon size={16} />}
            {cat === 'queso' && <KitchenIcon size={16} />}
            {cat === 'mantequilla' && <EggIcon size={16} />}
            {cat === 'manjar' && <CookieIcon size={16} />}
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
            <InventoryIcon size={40} className="text-neutral-300 dark:text-neutral-700 mb-4" />
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
                  <EditIcon size={16} className="mr-1" />
                  Editar
                </button>
                <button
                  onClick={() => { if (confirm('¿Eliminar este producto?')) deleteProduct(product.id); }}
                  className="flex-1 py-2 text-xs font-light text-neutral-400 hover:text-red-600 dark:text-neutral-600 dark:hover:text-red-400 transition-colors uppercase tracking-wider"
                >
                  <DeleteIcon size={16} className="mr-1" />
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
                  <CloseIcon size={20} />
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
                    className="w-full px-0 py-3 border-0 border-b border-neutral-200 dark:border-neutral-800 bg-transparent text-black dark:text-white text-base font-light focus:outline-none focus:border-black dark:focus:border-white transition-colors cursor-pointer dark:bg-black">
                    <option value="yogurt" className="dark:bg-black dark:text-white">Yogurt</option>
                    <option value="queso" className="dark:bg-black dark:text-white">Queso</option>
                    <option value="mantequilla" className="dark:bg-black dark:text-white">Mantequilla</option>
                    <option value="manjar" className="dark:bg-black dark:text-white">Manjar</option>
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
  const { orders, updateOrderStatus, updatePaymentMethod, deleteOrder, getTotalSales, getSalesByPaymentMethod } = useOrders();
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed' | 'cancelled'>('all');
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [editingPayment, setEditingPayment] = useState<string | null>(null);
  const [newPaymentMethod, setNewPaymentMethod] = useState<'yape' | 'efectivo' | 'credito'>('efectivo');
  const [newCreditDueDate, setNewCreditDueDate] = useState('');
  const [approvedOrders, setApprovedOrders] = useState<Set<string>>(new Set());
  const [inDeliveryOrders, setInDeliveryOrders] = useState<Set<string>>(new Set());
  
  // Delete confirmation modal state
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [orderToDelete, setOrderToDelete] = useState<string | null>(null);
  const [orderToDeleteName, setOrderToDeleteName] = useState('');

  // Open delete confirmation modal
  const openDeleteModal = (orderId: string, customerName: string) => {
    setOrderToDelete(orderId);
    setOrderToDeleteName(customerName);
    setDeleteModalOpen(true);
  };

  // Confirm delete
  const confirmDelete = async () => {
    if (orderToDelete) {
      await deleteOrder(orderToDelete);
      setDeleteModalOpen(false);
      setOrderToDelete(null);
      setOrderToDeleteName('');
    }
  };

  // Send notification to customer
  const sendNotificationToCustomer = async (title: string, body: string) => {
    try {
      const { data: subscriptions } = await supabase
        .from('push_subscriptions')
        .select('*')
        .eq('user_type', 'customer');

      if (subscriptions && subscriptions.length > 0) {
        for (const sub of subscriptions) {
          await fetch('/api/push/send', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              subscription: {
                endpoint: sub.endpoint,
                keys: { p256dh: sub.p256dh, auth: sub.auth }
              },
              notification: { title, body, tag: 'order-update', requireInteraction: true }
            })
          });
        }
      }
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Approve order and notify customer
  const approveOrder = async (orderId: string) => {
    setApprovedOrders(prev => new Set(prev).add(orderId));
    await sendNotificationToCustomer(
      '¡Pedido Aprobado!',
      'Tu pedido ha sido aprobado y está en preparación.'
    );
  };

  // Mark order as in delivery and notify customer
  const markAsInDelivery = async (orderId: string) => {
    setInDeliveryOrders(prev => new Set(prev).add(orderId));
    await sendNotificationToCustomer(
      '¡Pedido en Camino!',
      'Tu pedido está en camino a tu ubicación.'
    );
  };

  const filteredOrders = orders.filter(order => filter === 'all' || order.status === filter);

  // Group orders by date for calendar
  const ordersByDate = orders.reduce((acc, order) => {
    const dateKey = new Date(order.createdAt).toDateString();
    if (!acc[dateKey]) {
      acc[dateKey] = [];
    }
    acc[dateKey].push(order);
    return acc;
  }, {} as Record<string, typeof orders>);

  // Get orders for selected date
  const selectedDateOrders = selectedDate ? ordersByDate[selectedDate.toDateString()] || [] : [];

  // Calculate total sales and products for selected date
  const selectedDateStats = selectedDateOrders.reduce((acc, order) => {
    if (order.status === 'completed') {
      acc.totalSales += order.total;
      order.items.forEach(item => {
        acc.products[item.name] = (acc.products[item.name] || 0) + item.quantity;
      });
    }
    return acc;
  }, { totalSales: 0, products: {} as Record<string, number> });

  // Calendar helpers
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();
    
    const days: (Date | null)[] = [];
    for (let i = 0; i < startingDay; i++) {
      days.push(null);
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const getSalesForDate = (date: Date) => {
    const dateOrders = ordersByDate[date.toDateString()] || [];
    return dateOrders
      .filter(o => o.status === 'completed')
      .reduce((sum, o) => sum + o.total, 0);
  };

  const hasOrdersOnDate = (date: Date) => {
    return ordersByDate[date.toDateString()]?.length > 0;
  };

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

      {/* Notifications Section */}
      <AdminNotifications />

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

      {/* Payment Method Stats */}
      <div className="grid grid-cols-3 gap-4 lg:gap-6">
        {(() => {
          const sales = getSalesByPaymentMethod();
          return (
            <>
              <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6 bg-purple-50 dark:bg-purple-900/10">
                <p className="text-xs font-light text-purple-600 dark:text-purple-400 uppercase tracking-widest mb-2">Yape</p>
                <p className="text-xl lg:text-2xl font-extralight text-black dark:text-white">
                  S/{sales.yape.toFixed(2)}
                </p>
              </div>
              <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6 bg-green-50 dark:bg-green-900/10">
                <p className="text-xs font-light text-green-600 dark:text-green-400 uppercase tracking-widest mb-2">Efectivo</p>
                <p className="text-xl lg:text-2xl font-extralight text-black dark:text-white">
                  S/{sales.efectivo.toFixed(2)}
                </p>
              </div>
              <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6 bg-orange-50 dark:bg-orange-900/10">
                <p className="text-xs font-light text-orange-600 dark:text-orange-400 uppercase tracking-widest mb-2">Fiado</p>
                <p className="text-xl lg:text-2xl font-extralight text-black dark:text-white">
                  S/{sales.credito.toFixed(2)}
                </p>
              </div>
            </>
          );
        })()}
      </div>

      {/* View Toggle */}
      <div className="flex items-center justify-between border-b border-neutral-100 dark:border-neutral-900 pb-4 lg:pb-6">
        <div className="flex flex-wrap gap-2 lg:gap-3">
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
              {f === 'all' && <ReceiptIcon size={16} />}
              {f === 'pending' && <PendingActionsIcon size={16} />}
              {f === 'completed' && <CheckCircleIcon size={16} />}
              {f === 'cancelled' && <CancelIcon size={16} />}
              <span className="hidden sm:inline">{filterLabels[f]}</span>
              <span className={`ml-1 lg:ml-2 text-xs ${filter === f ? 'opacity-70' : 'text-neutral-300 dark:text-neutral-600'}`}>
                {f === 'all' ? orders.length : orders.filter(o => o.status === f).length}
              </span>
            </button>
          ))}
        </div>
        <button
          onClick={() => setViewMode(viewMode === 'list' ? 'calendar' : 'list')}
          className="flex items-center gap-2 px-4 py-2 text-sm font-light tracking-wide border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 hover:border-neutral-400 dark:hover:border-neutral-600 transition-all"
        >
          <CalendarIcon size={16} />
          <span className="hidden sm:inline">
            {viewMode === 'list' ? 'Ver calendario' : 'Ver lista'}
          </span>
        </button>
      </div>

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div className="space-y-6">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
              className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M15 18l-6-6 6-6" />
              </svg>
            </button>
            <h2 className="text-lg font-light tracking-tight">
              {currentMonth.toLocaleDateString('es-PE', { month: 'long', year: 'numeric' })}
            </h2>
            <button
              onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
              className="p-2 text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 18l6-6-6-6" />
              </svg>
            </button>
          </div>

          {/* Calendar Grid */}
          <div className="border border-neutral-100 dark:border-neutral-900">
            {/* Weekday Headers */}
            <div className="grid grid-cols-7 border-b border-neutral-100 dark:border-neutral-900">
              {['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'].map(day => (
                <div key={day} className="py-2 text-center text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase">
                  {day}
                </div>
              ))}
            </div>

            {/* Calendar Days */}
            <div className="grid grid-cols-7">
              {getDaysInMonth(currentMonth).map((date, idx) => (
                <div key={idx} className="min-h-[80px] border-r border-b border-neutral-100 dark:border-neutral-900 last:border-r-0">
                  {date && (
                    <button
                      onClick={() => setSelectedDate(date)}
                      className={`w-full h-full p-2 text-left transition-colors ${
                        selectedDate?.toDateString() === date.toDateString()
                          ? 'bg-neutral-100 dark:bg-neutral-900'
                          : 'hover:bg-neutral-50 dark:hover:bg-neutral-900/50'
                      }`}
                    >
                      <span className={`text-sm font-light ${
                        hasOrdersOnDate(date) ? 'font-medium text-black dark:text-white' : 'text-neutral-500 dark:text-neutral-500'
                      }`}>
                        {date.getDate()}
                      </span>
                      {getSalesForDate(date) > 0 && (
                        <p className="text-xs font-light text-neutral-400 dark:text-neutral-500 mt-1">
                          S/{getSalesForDate(date).toFixed(2)}
                        </p>
                      )}
                      {hasOrdersOnDate(date) && (
                        <p className="text-[10px] font-light text-neutral-300 dark:text-neutral-600 mt-0.5">
                          {ordersByDate[date.toDateString()].length} pedidos
                        </p>
                      )}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Selected Date Detail */}
          {selectedDate && (
            <div className="border border-neutral-100 dark:border-neutral-900 p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-light tracking-tight">
                  Ventas del {selectedDate.toLocaleDateString('es-PE', { day: 'numeric', month: 'long', year: 'numeric' })}
                </h3>
                <button
                  onClick={() => setSelectedDate(null)}
                  className="text-neutral-400 hover:text-black dark:hover:text-white transition-colors"
                >
                  <CloseIcon size={20} />
                </button>
              </div>

              {selectedDateOrders.length === 0 ? (
                <p className="text-sm font-light text-neutral-400 dark:text-neutral-600">
                  No hay pedidos en esta fecha
                </p>
              ) : (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div className="border border-neutral-100 dark:border-neutral-900 p-4">
                      <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase">Total ventas</p>
                      <p className="text-2xl font-extralight text-black dark:text-white">
                        S/{selectedDateStats.totalSales.toFixed(2)}
                      </p>
                    </div>
                    <div className="border border-neutral-100 dark:border-neutral-900 p-4">
                      <p className="text-xs font-light text-neutral-400 dark:text-neutral-600 uppercase">Total pedidos</p>
                      <p className="text-2xl font-extralight text-black dark:text-white">
                        {selectedDateOrders.length}
                      </p>
                    </div>
                  </div>

                  {/* Products sold */}
                  {Object.keys(selectedDateStats.products).length > 0 && (
                    <div>
                      <h4 className="text-sm font-light text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-3">
                        Productos vendidos
                      </h4>
                      <div className="space-y-2">
                        {Object.entries(selectedDateStats.products).map(([name, quantity]) => (
                          <div key={name} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-900 last:border-0">
                            <span className="text-sm font-light text-black dark:text-white">{name}</span>
                            <span className="text-sm font-light text-neutral-500 dark:text-neutral-500">{quantity} unidades</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Orders list for this date */}
                  <div className="mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                    <h4 className="text-sm font-light text-neutral-500 dark:text-neutral-500 uppercase tracking-wider mb-3">
                      Pedidos del día
                    </h4>
                    <div className="space-y-2">
                      {selectedDateOrders.map(order => (
                        <div key={order.id} className="flex items-center justify-between py-2 text-sm">
                          <div>
                            <span className="font-light text-black dark:text-white">{order.customerName}</span>
                            <span className="text-neutral-400 dark:text-neutral-600 ml-2">
                              {order.status === 'completed' ? '✓' : order.status === 'cancelled' ? '✗' : '○'}
                            </span>
                          </div>
                          <span className="font-light text-neutral-600 dark:text-neutral-400">
                            S/{order.total.toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Orders List - Only show in list view */}
      {viewMode === 'list' && (
      <div>
        {filteredOrders.length === 0 ? (
          <div className="py-16 text-center border border-neutral-100 dark:border-neutral-900">
            <InboxIcon size={40} className="text-neutral-300 dark:text-neutral-700 mb-4" />
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
                      <PersonIcon size={20} className="text-neutral-400" />
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
                    {/* Payment Method Badge */}
                    <div className="flex items-center gap-1 mt-1">
                      <PaymentMethodBadge method={order.paymentMethod} />
                      {order.paymentMethod === 'credito' && order.creditDueDate && (
                        <span className="text-[10px] text-orange-500 dark:text-orange-400">
                          (Pagar: {new Date(order.creditDueDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })})
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2 lg:gap-4 mt-4 lg:mt-6 pt-4 border-t border-neutral-100 dark:border-neutral-900">
                  {order.status === 'pending' && (
                    <>
                      {/* Approve Button */}
                      <button
                        onClick={() => approveOrder(order.id)}
                        className={`flex-1 lg:flex-none py-2 px-4 text-xs font-light transition-colors uppercase tracking-wider flex items-center justify-center gap-2 ${
                          approvedOrders.has(order.id)
                            ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300'
                            : 'text-neutral-500 hover:text-green-600 dark:text-neutral-500 dark:hover:text-green-400'
                        }`}
                      >
                        <NotificationsIcon size={16} />
                        {approvedOrders.has(order.id) ? 'Aprobado ✓' : 'Aprobar'}
                      </button>

                      {/* In Delivery Button */}
                      <button
                        onClick={() => markAsInDelivery(order.id)}
                        className={`flex-1 lg:flex-none py-2 px-4 text-xs font-light transition-colors uppercase tracking-wider flex items-center justify-center gap-2 ${
                          inDeliveryOrders.has(order.id)
                            ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                            : 'text-neutral-500 hover:text-blue-600 dark:text-neutral-500 dark:hover:text-blue-400'
                        }`}
                      >
                        <TruckIcon size={16} />
                        {inDeliveryOrders.has(order.id) ? 'En Camino ✓' : 'En Camino'}
                      </button>

                      <button
                        onClick={() => updateOrderStatus(order.id, 'completed')}
                        className="flex-1 lg:flex-none py-2 px-4 text-xs font-light text-neutral-500 hover:text-black dark:text-neutral-500 dark:hover:text-white transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <CheckIcon size={16} />
                        Completar
                      </button>
                      <button
                        onClick={() => updateOrderStatus(order.id, 'cancelled')}
                        className="flex-1 lg:flex-none py-2 px-4 text-xs font-light text-neutral-400 hover:text-red-600 dark:text-neutral-600 dark:hover:text-red-400 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                      >
                        <CloseIcon size={16} />
                        Cancelar
                      </button>
                    </>
                  )}
                  {order.status !== 'pending' && (
                    <button
                      onClick={() => updateOrderStatus(order.id, 'pending')}
                      className="flex-1 lg:flex-none py-2 px-4 text-xs font-light text-neutral-400 hover:text-black dark:text-neutral-600 dark:hover:text-white transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <RefreshIcon size={16} />
                      Marcar Pendiente
                    </button>
                  )}
                  <button
                    onClick={() => openDeleteModal(order.id, order.customerName)}
                    className="py-2 px-4 text-neutral-400 hover:text-red-600 dark:text-neutral-600 dark:hover:text-red-400 transition-colors"
                  >
                    <DeleteIcon size={16} />
                  </button>

                  {/* Edit Payment Button */}
                  {editingPayment === order.id ? (
                    <div className="flex-1 flex flex-wrap gap-2 items-center">
                      <select
                        value={newPaymentMethod}
                        onChange={(e) => setNewPaymentMethod(e.target.value as 'yape' | 'efectivo' | 'credito')}
                        className="text-xs border border-neutral-300 dark:border-neutral-600 px-2 py-1 bg-white dark:bg-neutral-700"
                      >
                        <option value="yape">Yape</option>
                        <option value="efectivo">Efectivo</option>
                        <option value="credito">Fiado</option>
                      </select>
                      {newPaymentMethod === 'credito' && (
                        <input
                          type="date"
                          value={newCreditDueDate}
                          onChange={(e) => setNewCreditDueDate(e.target.value)}
                          className="text-xs border border-neutral-300 dark:border-neutral-600 px-2 py-1"
                          placeholder="Fecha de pago"
                        />
                      )}
                      <button
                        onClick={async () => {
                          await updatePaymentMethod(order.id, newPaymentMethod, newPaymentMethod === 'credito' ? newCreditDueDate : undefined);
                          setEditingPayment(null);
                        }}
                        className="text-xs px-2 py-1 bg-black dark:bg-white text-white dark:text-black"
                      >
                        Guardar
                      </button>
                      <button
                        onClick={() => setEditingPayment(null)}
                        className="text-xs px-2 py-1 border border-neutral-300 dark:border-neutral-600"
                      >
                        Cancelar
                      </button>
                    </div>
                  ) : (
                    <button
                      onClick={() => {
                        setEditingPayment(order.id);
                        setNewPaymentMethod(order.paymentMethod);
                        setNewCreditDueDate(order.creditDueDate || '');
                      }}
                      className="flex-1 lg:flex-none py-2 px-4 text-xs font-light text-neutral-400 hover:text-blue-600 dark:text-neutral-600 dark:hover:text-blue-400 transition-colors uppercase tracking-wider flex items-center justify-center gap-2"
                    >
                      <EditIcon size={16} />
                      Editar Pago
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      )}

      {/* Delete Confirmation Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-700 rounded-lg p-6 max-w-md w-full shadow-2xl">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 w-12 h-12 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center">
                <DeleteIcon size={24} className="text-red-600 dark:text-red-400" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-black dark:text-white">
                  ¿Eliminar pedido?
                </h3>
                <p className="mt-2 text-sm text-neutral-600 dark:text-neutral-400">
                  Estás por eliminar el pedido de <span className="font-medium text-black dark:text-white">{orderToDeleteName}</span>. Esta acción no se puede deshacer.
                </p>
              </div>
            </div>
            <div className="mt-6 flex gap-3 justify-end">
              <button
                onClick={() => setDeleteModalOpen(false)}
                className="px-4 py-2 text-sm font-medium text-neutral-700 dark:text-neutral-300 hover:text-black dark:hover:text-white transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 text-sm font-medium bg-red-600 text-white hover:bg-red-700 rounded-lg transition-colors"
              >
                Sí, eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Shared Components
function StatCard({ title, value, subtitle, icon }: { title: string; value: string | number; subtitle: string; icon: string }) {
  return (
    <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
      {icon === 'inventory_2' && <InventoryIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      {icon === 'today' && <TodayIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      {icon === 'payments' && <PaymentsIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      {icon === 'pending_actions' && <PendingActionsIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 uppercase tracking-widest mb-1">{title}</p>
      <p className="text-xl lg:text-3xl font-extralight text-black dark:text-white mt-1 lg:mt-2">{value}</p>
      <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 mt-1 lg:mt-2">{subtitle}</p>
    </div>
  );
}

function StatBox({ label, value, icon }: { label: string; value: number; icon: string }) {
  return (
    <div className="border border-neutral-100 dark:border-neutral-900 p-4 lg:p-6">
      {icon === 'receipt_long' && <ReceiptIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      {icon === 'pending_actions' && <PendingActionsIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      {icon === 'check_circle' && <CheckCircleIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      {icon === 'cancel' && <CancelIcon size={20} className="text-neutral-500 dark:text-neutral-400 mb-2 lg:mb-3" />}
      <p className="text-xs font-light text-neutral-600 dark:text-neutral-400 uppercase tracking-widest mb-1">{label}</p>
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

function PaymentMethodBadge({ method }: { method: 'yape' | 'efectivo' | 'credito' }) {
  const styles = {
    yape: 'bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300',
    efectivo: 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300',
    credito: 'bg-orange-100 text-orange-700 dark:bg-orange-900/30 dark:text-orange-300',
  };
  const labels = { yape: 'Yape', efectivo: 'Efectivo', credito: 'Fiado' };
  return (
    <span className={`px-2 py-0.5 text-[10px] font-light tracking-wider uppercase rounded ${styles[method]}`}>
      {labels[method]}
    </span>
  );
}

// ...
