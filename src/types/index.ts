export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  category: 'yogurt' | 'queso' | 'mantequilla' | 'manjar';
  image?: string;
}

export interface CartItem extends Product {
  quantity: number;
}

export interface OrderItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  unit: string;
}

export interface Order {
  id: string;
  items: OrderItem[];
  customerName: string;
  phone: string;
  address: string;
  notes?: string;
  location?: string;
  total: number;
  status: 'pending' | 'completed' | 'cancelled';
  createdAt: string;
  paymentMethod: 'yape' | 'efectivo' | 'credito';
  creditDueDate?: string;
  deliveryDate?: string;
  lateFee?: number;
  lateFeeNotified?: boolean;
}
