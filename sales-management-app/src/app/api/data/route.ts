import { NextResponse } from 'next/server';
import { Product } from '@/types/product';
import { Customer } from '@/types/customer';
import { CompanyInfo } from '@/types/company';
import { Delivery } from '@/types/delivery';

// ダミーデータ
const products: Product[] = [
  {
    product_id: 'P001',
    product_name: '商品A',
    product_shippingName: '発送先A',
    product_shippingPostalcode: '123-4567',
    product_shippingAddress: '東京都渋谷区',
    product_shippingPhone: '090-1234-5678',
    product_tax: 10,
    product_unit: '個',
    product_unitPrice: 1000,
    product_note: 'テスト商品A',
    customer_name: '取引先A',
  },
  {
    product_id: 'P002',
    product_name: '商品B',
    product_shippingName: '発送先B',
    product_shippingPostalcode: '987-6543',
    product_shippingAddress: '大阪府大阪市',
    product_shippingPhone: '080-9876-5432',
    product_tax: 8,
    product_unit: '本',
    product_unitPrice: 500,
    product_note: 'テスト商品B',
    customer_name: '取引先B',
  },
];

const customers: Customer[] = [
  {
    customer_id: 'C001',
    customer_name: '取引先A',
    customer_formalName: '株式会社取引先A',
    customer_postalCode: '111-2222',
    customer_address: '神奈川県横浜市',
    customer_phone: '045-111-2222',
    customer_mail: 'customerA@example.com',
    customer_contactPerson: '担当者A',
    customer_rounding: '四捨五入',
    customer_closingDay: '20日',
    customer_paymentTerms: '翌月末',
    invoiceDeliveryMethod: '郵送',
  },
  {
    customer_id: 'C002',
    customer_name: '取引先B',
    customer_formalName: '有限会社取引先B',
    customer_postalCode: '333-4444',
    customer_address: '愛知県名古屋市',
    customer_phone: '052-333-4444',
    customer_mail: 'customerB@example.com',
    customer_contactPerson: '担当者B',
    customer_rounding: '切上げ',
    customer_closingDay: '末日',
    customer_paymentTerms: '翌々月10日',
    invoiceDeliveryMethod: 'メール',
  },
];

const companyInfo: CompanyInfo = {
  company_name: '自社名',
  company_postalCode: '100-0001',
  company_address: '東京都千代田区',
  company_phone: '03-1234-5678',
  company_fax: '03-8765-4321',
  company_mail: 'info@mycompany.com',
  company_contactPerson: '自社担当者',
  company_bankName: '〇〇銀行',
  company_bankBranch: '△△支店',
  company_bankType: '普通',
  company_bankNumber: '1234567',
  company_bankHolder: '株式会社自社',
  company_invoiveNumber: 'T1234567890123',
};

const deliveries: Delivery[] = [
  {
    delivery_id: 'D001',
    delivery_name: '商品A',
    delivery_quantity: 5,
    delivery_unitPrice: 1000,
    delivery_unit: '個',
    delivery_note: '納品テストA',
    delivery_tax: 10,
    delivery_orderId: 'ORD001',
    delivery_salesGroup: 'グループ1',
    customer_name: '取引先A',
    delivery_number: 'N001',
    delivery_invoiceNumber: 'I001',
    delivery_status: '済',
    delivery_invoiceStatus: '未',
    delivery_date: '2025-07-30',
  },
  {
    delivery_id: 'D002',
    delivery_name: '商品B',
    delivery_quantity: 10,
    delivery_unitPrice: 500,
    delivery_unit: '本',
    delivery_note: '納品テストB',
    delivery_tax: 8,
    delivery_orderId: 'ORD002',
    delivery_salesGroup: 'グループ2',
    customer_name: '取引先B',
    delivery_number: 'N002',
    delivery_invoiceNumber: 'I002',
    delivery_status: '未',
    delivery_invoiceStatus: '未',
    delivery_date: '2025-07-31',
  },
];

export async function GET() {
  return NextResponse.json({
    products,
    customers,
    companyInfo,
    deliveries,
  });
}
