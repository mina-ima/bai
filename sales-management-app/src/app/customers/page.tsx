'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';

export default function CustomersPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Customer, 'customer_id'>>({
    customer_name: '',
    customer_formalName: '',
    customer_postalCode: '',
    customer_address: '',
    customer_phone: '',
    customer_mail: '',
    customer_contactPerson: '',
    customer_rounding: '四捨五入',
    customer_closingDay: '',
    customer_paymentTerms: '',
    invoiceDeliveryMethod: '',
  });

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/customers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setFormData({
        customer_name: '',
        customer_formalName: '',
        customer_postalCode: '',
        customer_address: '',
        customer_phone: '',
        customer_mail: '',
        customer_contactPerson: '',
        customer_rounding: '四捨五入',
        customer_closingDay: '',
        customer_paymentTerms: '',
        invoiceDeliveryMethod: '',
      });
      fetchCustomers(); // 登録後にリストを更新
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (customerId: string) => {
    if (window.confirm('この取引先を削除してもよろしいですか？')) {
      try {
        const response = await fetch(`/api/customers/${customerId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchCustomers(); // 削除後にリストを更新
      } catch (e: any) {
        setError(e.message);
      }
    }
  };

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AuthenticatedLayout>
      <div className="w-4/5 mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center">取引先登録</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 mb-8">
          {/* Row 1: Customer Name & Formal Name */}
          <div className="mb-2 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_name">
                取引先名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_name"
                type="text"
                name="customer_name"
                value={formData.customer_name}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_formalName">
                取引先正式名称：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_formalName"
                type="text"
                name="customer_formalName"
                value={formData.customer_formalName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2: Postal Code & Address */}
          <div className="mb-2 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_postalCode">
                取引先〒：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_postalCode"
                type="text"
                name="customer_postalCode"
                value={formData.customer_postalCode}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_address">
                取引先住所：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_address"
                type="text"
                name="customer_address"
                value={formData.customer_address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Phone & Mail */}
          <div className="mb-2 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_phone">
                取引先電話：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_phone"
                type="text"
                name="customer_phone"
                value={formData.customer_phone}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_mail">
                取引先Mail：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_mail"
                type="email"
                name="customer_mail"
                value={formData.customer_mail}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4: Contact Person & Rounding */}
          <div className="mb-2 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_contactPerson">
                取引先担当者：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_contactPerson"
                type="text"
                name="customer_contactPerson"
                value={formData.customer_contactPerson}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_rounding">
                端数処理：
              </label>
              <select
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_rounding"
                name="customer_rounding"
                value={formData.customer_rounding}
                onChange={handleChange}
              >
                <option>四捨五入</option>
                <option>切上げ</option>
                <option>切捨て</option>
              </select>
            </div>
          </div>

          {/* Row 5: Closing Day & Payment Terms */}
          <div className="mb-2 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_closingDay">
                締日：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_closingDay"
                type="text"
                name="customer_closingDay"
                value={formData.customer_closingDay}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_paymentTerms">
                支払条件：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_paymentTerms"
                type="text"
                name="customer_paymentTerms"
                value={formData.customer_paymentTerms}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 6: Invoice Delivery Method (Full Width) */}
          <div className="mb-2 flex items-center">
            <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="invoiceDeliveryMethod">
              請求書発送方法：
            </label>
            <input
              className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              id="invoiceDeliveryMethod"
              type="text"
              name="invoiceDeliveryMethod"
              value={formData.invoiceDeliveryMethod}
              onChange={handleChange}
            />
          </div>

          <div className="flex items-center justify-center">
            <button
              className="w-full py-4 px-8 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 text-2xl"
              type="submit"
            >
              登録
            </button>
          </div>
        </form>

        <h2 className="text-size-30 font-bold text-center mt-[50px]">取引先リスト</h2>
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border-[3px] border-blue-600">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">取引先名</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">正式名称</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">郵便番号</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">住所</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">電話番号</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">メール</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">担当者</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">端数処理</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">締日</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">支払条件</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">請求書発送方法</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-center border-[3px] border-blue-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id} className="even:bg-gray-50 hover:bg-gray-100">
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_name}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_formalName}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_postalCode}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_address}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_phone}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_mail}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_contactPerson}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_rounding}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_closingDay}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.customer_paymentTerms}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{customer.invoiceDeliveryMethod}</td>
                    <td className="py-2 px-4 text-center border-[3px] border-blue-600 text-sm">
                      <button
                        onClick={() => handleDelete(customer.customer_id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
