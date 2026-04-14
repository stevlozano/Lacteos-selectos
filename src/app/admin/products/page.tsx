'use client';

import { useState } from 'react';
import { useProducts } from '@/context/ProductsContext';
import { Product } from '@/types';

type Category = 'yogurt' | 'queso' | 'mantequilla' | 'manjar';
type FilterCategory = Category | 'all';

interface FormData {
  name: string;
  description: string;
  price: string;
  unit: string;
  category: Category;
  image: string;
}

const categoryLabels: Record<FilterCategory, string> = {
  all: 'Todos',
  yogurt: 'Yogurts',
  queso: 'Quesos',
  mantequilla: 'Mantequilla',
  manjar: 'Manjar',
};

const categoryIcons: Record<FilterCategory, string> = {
  all: '📦',
  yogurt: '🥛',
  queso: '🧀',
  mantequilla: '🧈',
  manjar: '🍯',
};

export default function ProductsPage() {
  const { products, addProduct, updateProduct, deleteProduct } = useProducts();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [activeCategory, setActiveCategory] = useState<FilterCategory>('all');
  const [formData, setFormData] = useState<FormData>({
    name: '',
    description: '',
    price: '',
    unit: '',
    category: 'yogurt',
    image: '',
  });

  const filteredProducts = activeCategory === 'all' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const productData: Omit<Product, 'id'> = {
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
      setFormData({
        name: '',
        description: '',
        price: '',
        unit: '',
        category: 'yogurt',
        image: '',
      });
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingProduct(null);
  };

  const handleDelete = (id: string) => {
    if (confirm('¿Estás seguro de eliminar este producto?')) {
      deleteProduct(id);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-black dark:text-white">Productos</h1>
          <p className="text-neutral-600 dark:text-neutral-400 mt-1">
            Gestiona tus productos por categoría
          </p>
        </div>
        <button
          onClick={() => openModal()}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg 
                     flex items-center gap-2 transition-colors self-start md:self-auto"
        >
          <span>+</span>
          <span>Nuevo Producto</span>
        </button>
      </div>

      {/* Category Tabs */}
      <div className="flex flex-wrap gap-2 border-b border-neutral-200 dark:border-neutral-700 pb-4">
        {(['all', 'yogurt', 'queso', 'mantequilla', 'manjar'] as FilterCategory[]).map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeCategory === cat 
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 border border-green-200 dark:border-green-800' 
                : 'bg-white dark:bg-neutral-800 text-neutral-700 dark:text-neutral-300 border border-neutral-200 dark:border-neutral-700 hover:bg-neutral-50 dark:hover:bg-neutral-700'
              }`}
          >
            <span>{categoryIcons[cat]}</span>
            <span>{categoryLabels[cat]}</span>
            <span className={`ml-1 px-2 py-0.5 rounded-full text-xs
              ${activeCategory === cat
                ? 'bg-green-200 dark:bg-green-800 text-green-800 dark:text-green-200'
                : 'bg-neutral-200 dark:bg-neutral-700 text-neutral-600 dark:text-neutral-400'
              }`}>
              {cat === 'all' ? products.length : products.filter(p => p.category === cat).length}
            </span>
          </button>
        ))}
      </div>

      {/* Products Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredProducts.length === 0 ? (
          <div className="col-span-full text-center py-12 text-neutral-500 dark:text-neutral-400">
            <p className="text-4xl mb-2">{categoryIcons[activeCategory]}</p>
            <p>No hay productos en esta categoría</p>
            <button
              onClick={() => openModal()}
              className="mt-4 text-green-600 dark:text-green-400 hover:underline"
            >
              + Agregar el primer producto
            </button>
          </div>
        ) : filteredProducts.map((product) => (
          <div
            key={product.id}
            className="bg-white dark:bg-neutral-800 rounded-xl shadow-sm border border-neutral-200 
                       dark:border-neutral-700 overflow-hidden"
          >
            {product.image && (
              <div className="h-40 bg-neutral-100 dark:bg-neutral-700 relative">
                <img
                  src={product.image}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <div className="p-4">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="font-semibold text-black dark:text-white">
                    {product.name}
                  </h3>
                  <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">
                    {product.category}
                  </p>
                </div>
                <span className="font-bold text-green-600 dark:text-green-400">
                  S/{product.price.toFixed(2)}
                </span>
              </div>
              <p className="text-sm text-neutral-600 dark:text-neutral-400 mt-2 line-clamp-2">
                {product.description}
              </p>
              <p className="text-xs text-neutral-500 dark:text-neutral-500 mt-1">
                Por {product.unit}
              </p>
              
              <div className="flex gap-2 mt-4">
                <button
                  onClick={() => openModal(product)}
                  className="flex-1 bg-neutral-100 dark:bg-neutral-700 hover:bg-neutral-200 
                             dark:hover:bg-neutral-600 text-neutral-700 dark:text-neutral-300 
                             py-2 rounded-lg text-sm transition-colors"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(product.id)}
                  className="flex-1 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 
                             dark:hover:bg-red-900/30 text-red-600 dark:text-red-400 
                             py-2 rounded-lg text-sm transition-colors"
                >
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-neutral-800 rounded-xl shadow-xl max-w-md w-full max-h-[90vh] overflow-auto">
            <div className="p-6">
              <h2 className="text-xl font-bold text-black dark:text-white mb-4">
                {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
              </h2>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Nombre
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                               bg-white dark:bg-neutral-700 text-black dark:text-white"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Descripción
                  </label>
                  <textarea
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    required
                    rows={2}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                               bg-white dark:bg-neutral-700 text-black dark:text-white"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Precio (S/)
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.price}
                      onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                      required
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                                 bg-white dark:bg-neutral-700 text-black dark:text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                      Unidad
                    </label>
                    <input
                      type="text"
                      value={formData.unit}
                      onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                      required
                      placeholder="Litro, 500g, etc"
                      className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                                 bg-white dark:bg-neutral-700 text-black dark:text-white"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    Categoría
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value as Category })}
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                               bg-white dark:bg-neutral-700 text-black dark:text-white"
                  >
                    <option value="yogurt">Yogurt</option>
                    <option value="queso">Queso</option>
                    <option value="mantequilla">Mantequilla</option>
                    <option value="manjar">Manjar</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-neutral-700 dark:text-neutral-300 mb-1">
                    URL de Imagen (opcional)
                  </label>
                  <input
                    type="url"
                    value={formData.image}
                    onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                    placeholder="https://..."
                    className="w-full px-3 py-2 border border-neutral-300 dark:border-neutral-600 rounded-lg
                               bg-white dark:bg-neutral-700 text-black dark:text-white"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={closeModal}
                    className="flex-1 border border-neutral-300 dark:border-neutral-600 py-2 rounded-lg
                               text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-700"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg"
                  >
                    {editingProduct ? 'Guardar Cambios' : 'Crear Producto'}
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
