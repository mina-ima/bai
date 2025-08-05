export interface Delivery {
  delivery_id: string; // 納品ID、自動付番（一意）最大１０億件
  product_name: string; // 納品品番、「product_name」か自由入力
  quantity: number; // 納品数量、自由入力（数字）
  unit_price: number; // 納品単価、「product_unitPrice」か自由入力（数字）マイナス小数点含む
  delivery_unit: string; // 納品単位、「product_unit」か自由入力
  delivery_note: string; // 納品備考、「product_note」か自由入力
  delivery_tax: number; // 納品税区分、「product_tax」か自由入力（数字）
  delivery_orderId: string; // 注文番号、自由入力
  delivery_salesGroup: string; // 売上グループ、自由入力
  customer_name: string; // 取引先名、「customer_name」
  delivery_number: string; // 納品書番号、自動付番　最大１０億件
  delivery_invoiceNumber: string; // 請求書番号、自動付番　最大１０億件
  delivery_status: '済' | '未'; // 納品書ステータス、「済」か「未」
  delivery_invoiceStatus: '済' | '未'; // 請求書ステータス、「済」か「未」
  delivery_date: string; // 納品日、自由入力（日付）
  delivery_invoiceDate: string; // 請求日、自由入力（日付）
  total_amount: number; // 合計金額
}