export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'yogurt' | 'queso' | 'mantequilla' | 'manjar';
}

export interface CartItem extends Product {
  quantity: number;
}

export interface Order {
  items: CartItem[];
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  total: number;
}
