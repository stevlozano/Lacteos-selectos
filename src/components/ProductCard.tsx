'use client';

import { Product } from '@/types';
import { useCart } from '@/context/CartContext';

interface ProductCardProps {
  product: Product;
}

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart, items } = useCart();
  const cartItem = items.find(item => item.id === product.id);
  const quantity = cartItem?.quantity || 0;

  const categoryLabels: Record<string, string> = {
    yogurt: 'Yogurt',
    queso: 'Queso',
    mantequilla: 'Mantequilla',
    manjar: 'Manjar'
  };

  const hasImage = !!product.image;

  return (
    <div className={`group border border-neutral-200 dark:border-neutral-700 transition-all hover:border-black dark:hover:border-neutral-400 overflow-hidden relative ${hasImage ? 'h-80' : 'bg-white dark:bg-neutral-800 p-6'}`}>
      {hasImage ? (
        <>
          {/* Imagen de fondo */}
          <div 
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: `url(${product.image})` }}
          />
          {/* Overlay oscuro para mejorar legibilidad */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-black/20" />
          
          {/* Contenido sobre la imagen */}
          <div className="relative h-full flex flex-col justify-between p-6 text-white">
            <div className="flex items-start justify-between">
              <span className="text-xs uppercase tracking-wider text-white/80 bg-black/30 px-2 py-1 rounded">
                {categoryLabels[product.category]}
              </span>
              {quantity > 0 && (
                <span className="flex h-6 w-6 items-center justify-center bg-white text-black text-xs font-medium rounded-full">
                  {quantity}
                </span>
              )}
            </div>
            
            <div>
              <h3 className="mb-2 text-lg font-medium text-white">{product.name}</h3>
              <p className="mb-4 text-sm text-white/90 leading-relaxed">{product.description}</p>
              
              <div className="flex items-end justify-between">
                <div>
                  <span className="text-2xl font-light text-white">S/{product.price.toFixed(2)}</span>
                  <span className="ml-1 text-sm text-white/80">/ {product.unit}</span>
                </div>
                
                <button
                  onClick={() => addToCart(product)}
                  className="border border-white bg-white/20 backdrop-blur-sm px-4 py-2 text-sm font-medium text-white transition-all hover:bg-white hover:text-black"
                >
                  Agregar
                </button>
              </div>
            </div>
          </div>
        </>
      ) : (
        <>
          {/* Diseño sin imagen (original) */}
          <div className="mb-4 flex items-start justify-between">
            <span className="text-xs uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
              {categoryLabels[product.category]}
            </span>
            {quantity > 0 && (
              <span className="flex h-6 w-6 items-center justify-center bg-black dark:bg-white text-xs text-white dark:text-black">
                {quantity}
              </span>
            )}
          </div>
          
          <h3 className="mb-2 text-lg font-medium text-black dark:text-white">{product.name}</h3>
          <p className="mb-4 text-sm text-neutral-600 dark:text-neutral-400 leading-relaxed">{product.description}</p>
          
          <div className="flex items-end justify-between">
            <div>
              <span className="text-2xl font-light text-black dark:text-white">S/{product.price.toFixed(2)}</span>
              <span className="ml-1 text-sm text-neutral-500 dark:text-neutral-400">/ {product.unit}</span>
            </div>
            
            <button
              onClick={() => addToCart(product)}
              className="border border-black dark:border-white bg-white dark:bg-neutral-800 px-4 py-2 text-sm font-medium text-black dark:text-white transition-all hover:bg-black hover:text-white dark:hover:bg-white dark:hover:text-black"
            >
              Agregar
            </button>
          </div>
        </>
      )}
    </div>
  );
}
