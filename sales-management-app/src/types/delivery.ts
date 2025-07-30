export interface Delivery {
  delivery_id: string;
  delivery_name: string;
  delivery_quantity: number;
  delivery_unitPrice: number;
  delivery_unit: string;
  delivery_note: string;
  delivery_tax: number;
  delivery_orderId: string;
  delivery_salesGroup: string;
  customer_name: string;
  delivery_number: string;
  delivery_invoiceNumber: string;
  delivery_status: '済' | '未';
  delivery_invoiceStatus: '済' | '未';
  delivery_date: string;
}
