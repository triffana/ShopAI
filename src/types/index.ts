export type UserRole = 'customer' | 'admin';

export interface Profile {
  id: string;
  email: string;
  full_name: string | null;
  avatar_url: string | null;
  role: UserRole;
  created_at: string;
  updated_at?: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  image_url: string | null;
  created_at: string;
}

export interface Product {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number;
  discount_percent: number;
  rating: number;
  review_count: number;
  stock: number;
  image_url: string | null;
  images: string[];
  brand: string | null;
  category_id: string | null;
  is_featured: boolean;
  created_at: string;
  updated_at?: string;
  category?: Category;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export type OrderStatus = 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled';

export interface ShippingAddress {
  fullName: string;
  email: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  phone: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string | null;
  product_name?: string;
  price: number;
  quantity: number;
  product?: Product;
}

export interface Order {
  id: string;
  user_id: string | null;
  status: OrderStatus;
  total_amount: number;
  shipping_address?: ShippingAddress;
  payment_method?: string;
  created_at: string;
  updated_at?: string;
  order_items?: OrderItem[];
}

export interface WishlistItem {
  id: string;
  user_id: string;
  product_id: string;
  created_at: string;
  product?: Product;
}

export interface ProductFilterOptions {
  categoryId?: string;
  search?: string;
  minPrice?: number;
  maxPrice?: number;
  brand?: string;
  minRating?: number;
  inStockOnly?: boolean;
  sortBy?: 'newest' | 'price-asc' | 'price-desc' | 'rating' | 'popular';
}

export interface AdminDashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalCategories: number;
  totalCustomers: number;
  pendingOrdersCount: number;
  lowStockCount: number;
}
