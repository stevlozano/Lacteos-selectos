import { Product } from '@/types';

export const products: Product[] = [
  // Yogures
  {
    id: 'yogurt-pina',
    name: 'Yogurt de Piña',
    description: 'Yogurt cremoso con sabor a piña tropical',
    price: 9.00,
    unit: 'Litro',
    category: 'yogurt',
    image: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?w=400&h=300&fit=crop'
  },
  {
    id: 'yogurt-fresa',
    name: 'Yogurt de Fresa',
    description: 'Yogurt cremoso con sabor a fresa natural',
    price: 9.00,
    unit: 'Litro',
    category: 'yogurt',
    image: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?w=400&h=300&fit=crop'
  },
  {
    id: 'yogurt-lucuma',
    name: 'Yogurt de Lúcuma',
    description: 'Yogurt cremoso con sabor a lúcuma, fruta nativa peruana',
    price: 9.00,
    unit: 'Litro',
    category: 'yogurt',
    image: 'https://images.unsplash.com/photo-1571212515416-fdfdc17a233d?w=400&h=300&fit=crop'
  },
  {
    id: 'yogurt-vainilla',
    name: 'Yogurt de Vainilla',
    description: 'Yogurt cremoso con sabor a vainilla clásica',
    price: 9.00,
    unit: 'Litro',
    category: 'yogurt',
    image: 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400&h=300&fit=crop'
  },
  {
    id: 'yogurt-durazno',
    name: 'Yogurt de Durazno',
    description: 'Yogurt cremoso con sabor a durazno dulce',
    price: 9.00,
    unit: 'Litro',
    category: 'yogurt',
    image: 'https://images.unsplash.com/photo-1596404643764-9cb47c519e85?w=400&h=300&fit=crop'
  },
  // Quesos
  {
    id: 'queso-fresco',
    name: 'Queso Fresco',
    description: 'Queso fresco suave y ligero',
    price: 8.00,
    unit: '500g',
    category: 'queso'
  },
  {
    id: 'queso-cheddar',
    name: 'Queso Cheddar',
    description: 'Queso cheddar maduro, sabor intenso',
    price: 8.00,
    unit: '400g',
    category: 'queso'
  },
  {
    id: 'queso-mozzarella',
    name: 'Queso Mozzarella',
    description: 'Queso mozzarella ideal para pizza',
    price: 8.00,
    unit: '400g',
    category: 'queso'
  },
  // Mantequilla
  {
    id: 'mantequilla-sal',
    name: 'Mantequilla con Sal',
    description: 'Mantequilla tradicional con sal',
    price: 7.00,
    unit: '250g',
    category: 'mantequilla'
  },
  {
    id: 'mantequilla-sin-sal',
    name: 'Mantequilla sin Sal',
    description: 'Mantequilla sin sal, ideal para repostería',
    price: 7.00,
    unit: '250g',
    category: 'mantequilla'
  },
  // Manjar
  {
    id: 'manjar-blanco',
    name: 'Manjar Blanco',
    description: 'Manjar blanco cremoso tradicional',
    price: 4.50,
    unit: '400g',
    category: 'manjar'
  },
  {
    id: 'manjar-artesanal',
    name: 'Manjar Artesanal',
    description: 'Manjar blanco artesanal, receta tradicional',
    price: 6.00,
    unit: '400g',
    category: 'manjar'
  }
];
