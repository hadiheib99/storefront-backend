export interface Product {
  id?: number;
  name: string;
  price: number;
  category?: string | null;
  created_at?: string;
}

export interface User {
  id?: number;
  firstname: string;
  lastname: string;
  email: string;
  password_digest?: string;
  created_at?: string;
}

export type OrderStatus = "active" | "complete";

export interface Order {
  id?: number;
  user_id: number;
  status?: OrderStatus;
  created_at?: string;
}

export interface OrderProduct {
  id?: number;
  order_id: number;
  product_id: number;
  quantity: number;
}
