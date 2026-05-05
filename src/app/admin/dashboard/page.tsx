'use client';

import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';
import { useOrders } from '@/context/OrdersContext';
import { useProducts } from '@/context/ProductsContext';
import { Product, Order } from '@/types';
import { DashboardIcon, ProductsIcon, OrdersIcon, StoreIcon, SunIcon, MoonIcon, LogoutIcon, InboxIcon, PersonIcon, AddIcon, DrinkIcon, KitchenIcon, EggIcon, CookieIcon, TodayIcon, PaymentsIcon, PendingActionsIcon, CheckIcon, CloseIcon, RefreshIcon, DeleteIcon, EditIcon, CheckCircleIcon, CancelIcon, ReceiptIcon, InventoryIcon, PendingIcon, CalendarIcon, NotificationsIcon, TruckIcon } from '@/components/Icons';
import { AdminNotifications } from '@/components/AdminNotifications';
import { AdminNotificationPrompt } from '@/components/AdminNotificationPrompt';
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

      {/* Notification Prompt for Admin */}
      <AdminNotificationPrompt />
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

  // Order details modal state
  const [detailsModalOpen, setDetailsModalOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<typeof orders[0] | null>(null);

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
          <div className="py-16 text-center border border-neutral-100 dark:border-neutral-900 rounded-xl bg-white dark:bg-neutral-900">
            <InboxIcon size={48} className="text-neutral-300 dark:text-neutral-700 mb-4 mx-auto" />
            <p className="text-sm font-light text-neutral-400 dark:text-neutral-600 uppercase tracking-widest">
              No hay pedidos {filter !== 'all' && 'con este filtro'}
            </p>
          </div>
        ) : (
          <div className="grid gap-4">
            {filteredOrders.map((order) => (
              <div 
                key={order.id} 
                className="bg-white dark:bg-neutral-900 rounded-xl shadow-sm border border-neutral-100 dark:border-neutral-800 overflow-hidden hover:shadow-md transition-all duration-200"
              >
                {/* Header con info principal */}
                <div className="p-4 lg:p-5">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                    {/* Cliente info */}
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center flex-shrink-0">
                        <PersonIcon size={24} className="text-neutral-500 dark:text-neutral-400" />
                      </div>
                      <div>
                        <h3 className="font-medium text-black dark:text-white">{order.customerName}</h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs text-neutral-500 dark:text-neutral-400">{order.phone}</span>
                          {order.address && (
                            <span className="text-xs text-neutral-400 dark:text-neutral-500">• {order.address}</span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Status y Precio */}
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="text-2xl font-semibold text-black dark:text-white">
                          S/{order.total.toFixed(2)}
                        </p>
                        <p className="text-xs text-neutral-400 dark:text-neutral-500">
                          {new Date(order.createdAt).toLocaleDateString('es-PE', {
                            day: 'numeric',
                            month: 'short',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                      <StatusBadgeV2 status={order.status} />
                    </div>
                  </div>

                  {/* Badges de info */}
                  <div className="flex flex-wrap items-center gap-2 mt-4">
                    <PaymentMethodBadgeV2 method={order.paymentMethod} />
                    
                    {order.paymentMethod === 'credito' && order.creditDueDate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Pagar: {new Date(order.creditDueDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                      </span>
                    )}

                    {order.deliveryDate && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300">
                        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                        Entrega: {new Date(order.deliveryDate).toLocaleDateString('es-PE', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    
                    {/* Late Fee Badge */}
                    {order.paymentMethod === 'credito' && order.lateFee && order.lateFee > 0 && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300 border border-red-200 dark:border-red-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                        +Mora S/{order.lateFee.toFixed(2)}
                      </span>
                    )}
                    
                    {/* Late Fee Warning */}
                    {order.paymentMethod === 'credito' && order.creditDueDate && !order.lateFee && order.status === 'completed' && (() => {
                      const dueDate = new Date(order.creditDueDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return dueDate < today;
                    })() && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-300 border border-yellow-200 dark:border-yellow-800">
                        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                        Vencido
                      </span>
                    )}

                    {/* Resumen items */}
                    <span className="text-xs text-neutral-500 dark:text-neutral-400 ml-auto">
                      {order.items.length} producto{order.items.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Acciones */}
                <div className="px-4 lg:px-5 py-3 bg-neutral-50 dark:bg-neutral-800/50 border-t border-neutral-100 dark:border-neutral-800">
                  <div className="flex flex-wrap items-center gap-2">
                    
                    {/* Ver Detalles */}
                    <button
                      onClick={() => {
                        setSelectedOrder(order);
                        setDetailsModalOpen(true);
                      }}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300 bg-white dark:bg-neutral-700 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/></svg>
                      Ver Detalles
                    </button>

                    {order.status === 'pending' && (
                      <>
                        <button
                          onClick={() => approveOrder(order.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            approvedOrders.has(order.id)
                              ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300 border border-green-200 dark:border-green-800'
                              : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 hover:bg-green-50 dark:hover:bg-green-900/20 hover:text-green-700 dark:hover:text-green-300 hover:border-green-200 dark:hover:border-green-800'
                          }`}
                        >
                          <NotificationsIcon size={14} />
                          {approvedOrders.has(order.id) ? 'Aprobado ✓' : 'Aprobar'}
                        </button>

                        <button
                          onClick={() => markAsInDelivery(order.id)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg transition-all ${
                            inDeliveryOrders.has(order.id)
                              ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                              : 'bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:text-blue-700 dark:hover:text-blue-300 hover:border-blue-200 dark:hover:border-blue-800'
                          }`}
                        >
                          <TruckIcon size={14} />
                          {inDeliveryOrders.has(order.id) ? 'En Camino ✓' : 'En Camino'}
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order.id, 'completed')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-black dark:hover:bg-white hover:text-white dark:hover:text-black hover:border-black dark:hover:border-white transition-all"
                        >
                          <CheckIcon size={14} />
                          Completar
                        </button>

                        <button
                          onClick={() => updateOrderStatus(order.id, 'cancelled')}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-700 dark:hover:text-red-300 hover:border-red-200 dark:hover:border-red-800 transition-all"
                        >
                          <CloseIcon size={14} />
                          Cancelar
                        </button>
                      </>
                    )}

                    {order.status !== 'pending' && (
                      <button
                        onClick={() => updateOrderStatus(order.id, 'pending')}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-white dark:bg-neutral-700 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-600 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-600 transition-colors"
                      >
                        <RefreshIcon size={14} />
                        Marcar Pendiente
                      </button>
                    )}

                    {/* Apply Late Fee */}
                    {order.paymentMethod === 'credito' && order.creditDueDate && !order.lateFee && order.status === 'completed' && (() => {
                      const dueDate = new Date(order.creditDueDate);
                      const today = new Date();
                      today.setHours(0, 0, 0, 0);
                      return dueDate < today;
                    })() && (
                      <button
                        onClick={async () => {
                          await supabase.from('orders').update({ late_fee: 1, late_fee_notified: false }).eq('id', order.id);
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                        Aplicar Mora S/1.00
                      </button>
                    )}

                    {/* Notificar Mora WhatsApp */}
                    {order.paymentMethod === 'credito' && order.lateFee && order.lateFee > 0 && order.phone && (
                      <button
                        onClick={() => {
                          const lateFee = order.lateFee || 0;
                          const message = `Hola ${order.customerName}, te recordamos que tu pedido fiado tiene una mora de S/${lateFee.toFixed(2)} por pago atrasado. Fecha de vencimiento: ${order.creditDueDate ? new Date(order.creditDueDate).toLocaleDateString('es-PE') : 'N/A'}. Total a pagar: S/${(order.total + lateFee).toFixed(2)}`;
                          const phone = order.phone.replace(/\D/g, '');
                          const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
                          window.open(url, '_blank');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.006c6.553 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                        Notificar por WhatsApp
                      </button>
                    )}

                    <div className="flex-1"></div>

                    {/* Editar Pago */}
                    {editingPayment === order.id ? (
                      <div className="flex items-center gap-2">
                        <select
                          value={newPaymentMethod}
                          onChange={(e) => setNewPaymentMethod(e.target.value as 'yape' | 'efectivo' | 'credito')}
                          className="text-xs border border-neutral-300 dark:border-neutral-600 px-2 py-1 rounded bg-white dark:bg-neutral-700"
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
                            className="text-xs border border-neutral-300 dark:border-neutral-600 px-2 py-1 rounded bg-white dark:bg-neutral-700"
                          />
                        )}
                        <button
                          onClick={async () => {
                            await updatePaymentMethod(order.id, newPaymentMethod, newPaymentMethod === 'credito' ? newCreditDueDate : undefined);
                            setEditingPayment(null);
                          }}
                          className="text-xs px-2 py-1 bg-black dark:bg-white text-white dark:text-black rounded"
                        >
                          Guardar
                        </button>
                        <button
                          onClick={() => setEditingPayment(null)}
                          className="text-xs px-2 py-1 border border-neutral-300 dark:border-neutral-600 rounded"
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => {
                          setEditingPayment(order.id);
                          setNewPaymentMethod(order.paymentMethod);
                          setNewCreditDueDate(order.creditDueDate || '');
                        }}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-500 dark:text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200 transition-colors"
                      >
                        <EditIcon size={14} />
                        Editar Pago
                      </button>
                    )}

                    {/* Eliminar */}
                    <button
                      onClick={() => openDeleteModal(order.id, order.customerName)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-neutral-400 hover:text-red-600 dark:text-neutral-500 dark:hover:text-red-400 transition-colors"
                    >
                      <DeleteIcon size={14} />
                    </button>
                  </div>
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

      {/* Order Details Modal */}
      <OrderDetailsModal
        order={selectedOrder}
        isOpen={detailsModalOpen}
        onClose={() => { setDetailsModalOpen(false); setSelectedOrder(null); }}
        onUpdateStatus={updateOrderStatus}
        onApplyLateFee={async (id) => { await supabase.from('orders').update({ late_fee: 1, late_fee_notified: false }).eq('id', id); }}
        onNotifyLateFee={(order) => {
          const lateFee = order.lateFee || 0;
          const message = `Hola ${order.customerName}, te recordamos que tu pedido fiado tiene una mora de S/${lateFee.toFixed(2)} por pago atrasado. Fecha de vencimiento: ${order.creditDueDate ? new Date(order.creditDueDate).toLocaleDateString('es-PE') : 'N/A'}. Total a pagar: S/${(order.total + lateFee).toFixed(2)}`;
          const phone = order.phone.replace(/\D/g, '');
          const url = `https://wa.me/${phone}?text=${encodeURIComponent(message)}`;
          window.open(url, '_blank');
        }}
      />
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

// New improved badge components
function StatusBadgeV2({ status }: { status: string }) {
  const config = {
    pending: {
      bg: 'bg-amber-50 dark:bg-amber-900/20',
      border: 'border-amber-200 dark:border-amber-800',
      text: 'text-amber-700 dark:text-amber-300',
      dot: 'bg-amber-500',
      label: 'Pendiente'
    },
    completed: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      dot: 'bg-green-500',
      label: 'Completado'
    },
    cancelled: {
      bg: 'bg-red-50 dark:bg-red-900/20',
      border: 'border-red-200 dark:border-red-800',
      text: 'text-red-700 dark:text-red-300',
      dot: 'bg-red-500',
      label: 'Cancelado'
    }
  };
  const style = config[status as keyof typeof config];
  return (
    <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border ${style.bg} ${style.border} ${style.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {style.label}
    </span>
  );
}

function PaymentMethodBadgeV2({ method }: { method: 'yape' | 'efectivo' | 'credito' }) {
  const config = {
    yape: {
      bg: 'bg-purple-50 dark:bg-purple-900/20',
      border: 'border-purple-200 dark:border-purple-800',
      text: 'text-purple-700 dark:text-purple-300',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><rect width={20} height={14} x={2} y={5} rx={2}/><path d="M2 10h20"/></svg>
      ),
      label: 'Yape'
    },
    efectivo: {
      bg: 'bg-green-50 dark:bg-green-900/20',
      border: 'border-green-200 dark:border-green-800',
      text: 'text-green-700 dark:text-green-300',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="m15 9-6 6"/><path d="m9 9 6 6"/></svg>
      ),
      label: 'Efectivo'
    },
    credito: {
      bg: 'bg-orange-50 dark:bg-orange-900/20',
      border: 'border-orange-200 dark:border-orange-800',
      text: 'text-orange-700 dark:text-orange-300',
      icon: (
        <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M16 8h-6a2 2 0 1 0 0 4h4a2 2 0 1 1 0 4H8"/><path d="M12 18V6"/></svg>
      ),
      label: 'Fiado'
    }
  };
  const style = config[method];
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${style.bg} ${style.border} ${style.text}`}>
      {style.icon}
      {style.label}
    </span>
  );
}

// Order Details Modal Component
function OrderDetailsModal({ 
  order, 
  isOpen, 
  onClose,
  onUpdateStatus,
  onApplyLateFee,
  onNotifyLateFee
}: { 
  order: Order | null;
  isOpen: boolean;
  onClose: () => void;
  onUpdateStatus: (id: string, status: 'pending' | 'completed' | 'cancelled') => void;
  onApplyLateFee: (id: string) => void;
  onNotifyLateFee: (order: Order) => void;
}) {
  if (!isOpen || !order) return null;

  const totalWithLateFee = order.total + (order.lateFee || 0);
  const isLateFeeApplicable = order.paymentMethod === 'credito' && order.creditDueDate && !order.lateFee && order.status === 'completed' && (() => {
    const dueDate = new Date(order.creditDueDate);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return dueDate < today;
  })();

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-white dark:bg-neutral-900 rounded-2xl shadow-2xl max-w-lg w-full max-h-[90vh] overflow-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white dark:bg-neutral-900 border-b border-neutral-100 dark:border-neutral-800 p-4 lg:p-6 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-black dark:text-white">Detalles del Pedido</h2>
            <p className="text-xs text-neutral-500 dark:text-neutral-400 mt-1">ID: {order.id}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        <div className="p-4 lg:p-6 space-y-6">
          {/* Cliente */}
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-neutral-100 to-neutral-200 dark:from-neutral-800 dark:to-neutral-700 flex items-center justify-center flex-shrink-0">
              <PersonIcon size={28} className="text-neutral-500 dark:text-neutral-400" />
            </div>
            <div className="flex-1">
              <h3 className="font-semibold text-lg text-black dark:text-white">{order.customerName}</h3>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <a href={`tel:${order.phone}`} className="text-sm text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                  {order.phone}
                </a>
              </div>
              {order.address && (
                <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 flex items-start gap-1">
                  <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="mt-0.5 flex-shrink-0"><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                  {order.address}
                </p>
              )}
            </div>
          </div>

          {/* Status y Pago */}
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadgeV2 status={order.status} />
            <PaymentMethodBadgeV2 method={order.paymentMethod} />
            {order.paymentMethod === 'credito' && order.creditDueDate && (
              <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${
                order.lateFee ? 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300 border-red-200' : 'bg-orange-50 text-orange-700 dark:bg-orange-900/20 dark:text-orange-300 border-orange-200'
              }`}>
                <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                {order.lateFee ? 'Vencido con mora' : `Vence: ${new Date(order.creditDueDate).toLocaleDateString('es-PE')}`}
              </span>
            )}
            {order.deliveryDate && (
              <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
                Entrega: {new Date(order.deliveryDate).toLocaleDateString('es-PE')}
              </span>
            )}
          </div>

          {/* Productos */}
          <div className="bg-neutral-50 dark:bg-neutral-800/50 rounded-xl p-4">
            <h4 className="text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-3 flex items-center gap-2">
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M6 2 3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4Z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>
              Productos ({order.items.length})
            </h4>
            <div className="space-y-2">
              {order.items.map((item, idx) => (
                <div key={idx} className="flex items-center justify-between py-2 border-b border-neutral-100 dark:border-neutral-700 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="w-6 h-6 rounded-full bg-neutral-200 dark:bg-neutral-700 flex items-center justify-center text-xs font-medium text-neutral-600 dark:text-neutral-400">
                      {item.quantity}
                    </span>
                    <span className="text-sm text-neutral-700 dark:text-neutral-300">{item.name}</span>
                  </div>
                  <span className="text-sm font-medium text-neutral-900 dark:text-neutral-100">
                    S/{(item.price * item.quantity).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Totales */}
          <div className="border-t border-neutral-100 dark:border-neutral-800 pt-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-neutral-500 dark:text-neutral-400">Subtotal</span>
                <span className="text-neutral-700 dark:text-neutral-300">S/{order.total.toFixed(2)}</span>
              </div>
              {order.lateFee && order.lateFee > 0 && (
                <div className="flex justify-between text-sm">
                  <span className="text-red-600 dark:text-red-400 flex items-center gap-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 8v4"/><path d="M12 16h.01"/></svg>
                    Mora por atraso
                  </span>
                  <span className="text-red-600 dark:text-red-400 font-medium">+S/{order.lateFee.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between text-lg font-semibold pt-2 border-t border-neutral-100 dark:border-neutral-800">
                <span className="text-black dark:text-white">Total a pagar</span>
                <span className="text-black dark:text-white">S/{totalWithLateFee.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notas */}
          {order.notes && (
            <div className="bg-yellow-50 dark:bg-yellow-900/10 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
              <p className="text-xs text-yellow-700 dark:text-yellow-300 font-medium mb-1">Notas:</p>
              <p className="text-sm text-yellow-800 dark:text-yellow-200">{order.notes}</p>
            </div>
          )}

          {/* Ubicación */}
          {order.location && (
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-lg p-3">
              <p className="text-xs text-blue-700 dark:text-blue-300 font-medium mb-1 flex items-center gap-1">
                <svg xmlns="http://www.w3.org/2000/svg" width={12} height={12} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
                Ubicación GPS:
              </p>
              <a 
                href={order.location} 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-sm text-blue-600 dark:text-blue-400 hover:underline break-all"
              >
                {order.location}
              </a>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="sticky bottom-0 bg-white dark:bg-neutral-900 border-t border-neutral-100 dark:border-neutral-800 p-4 lg:p-6 space-y-3">
          {/* Primary Actions */}
          <div className="flex flex-wrap gap-2">
            {order.status === 'pending' && (
              <>
                <button
                  onClick={() => { onUpdateStatus(order.id, 'completed'); onClose(); }}
                  className="flex-1 min-w-[120px] inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-black dark:bg-white text-white dark:text-black text-sm font-medium rounded-lg hover:bg-neutral-800 dark:hover:bg-neutral-200 transition-colors"
                >
                  <CheckIcon size={16} />
                  Completar Pedido
                </button>
                <button
                  onClick={() => { onUpdateStatus(order.id, 'cancelled'); onClose(); }}
                  className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 border border-red-200 dark:border-red-800 text-sm font-medium rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors"
                >
                  <CloseIcon size={16} />
                  Cancelar
                </button>
              </>
            )}
            {order.status !== 'pending' && (
              <button
                onClick={() => { onUpdateStatus(order.id, 'pending'); onClose(); }}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-neutral-100 dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 text-sm font-medium rounded-lg hover:bg-neutral-200 dark:hover:bg-neutral-700 transition-colors"
              >
                <RefreshIcon size={16} />
                Marcar como Pendiente
              </button>
            )}
          </div>

          {/* Secondary Actions - Late Fee */}
          {isLateFeeApplicable && (
            <button
              onClick={() => { onApplyLateFee(order.id); onClose(); }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border border-orange-200 dark:border-orange-800 text-sm font-medium rounded-lg hover:bg-orange-100 dark:hover:bg-orange-900/30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
              Aplicar Mora S/1.00
            </button>
          )}

          {/* WhatsApp Notification */}
          {order.paymentMethod === 'credito' && order.lateFee && order.lateFee > 0 && order.phone && (
            <button
              onClick={() => { onNotifyLateFee(order); onClose(); }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-300 border border-green-200 dark:border-green-800 text-sm font-medium rounded-lg hover:bg-green-100 dark:hover:bg-green-900/30 transition-colors"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width={16} height={16} viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.72 1.46h.006c6.553 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
              Notificar Mora por WhatsApp
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// ...
