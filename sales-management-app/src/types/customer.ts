export interface Customer {
  customer_id: string;
  customer_name: string;
  customer_formalName: string;
  customer_postalCode: string;
  customer_address: string;
  customer_phone: string;
  customer_mail: string;
  customer_contactPerson: string;
  customer_rounding: '四捨五入' | '切上げ' | '切捨て';
  customer_closingDay: string;
  customer_paymentTerms: string;
  invoiceDeliveryMethod: string;
}
