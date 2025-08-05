export interface DeliveryItem {
  product_id: string;
  product_name: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

export interface Delivery {
  delivery_id: string;
  customer_id: string;
  customer_name: string;
  delivery_date: string;
  items: DeliveryItem[];
  total_amount: number;
  status: 'pending' | 'completed' | 'cancelled';
}