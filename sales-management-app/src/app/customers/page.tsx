'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';

interface EditableCustomer extends Customer {
  isEditing?: boolean;
}

export default function CustomersPage() {
  const [customers, setCustomers] = useState<EditableCustomer[]>([]);
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

  const handleEdit = (customerId: string) => {
    setCustomers(customers.map(customer =>
      customer.customer_id === customerId ? { ...customer, isEditing: true } : customer
    ));
  };

  const handleSave = async (customerToSave: EditableCustomer) => {
    try {
      const response = await fetch(`/api/customers/${customerToSave.customer_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(customerToSave),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setCustomers(customers.map(customer =>
        customer.customer_id === customerToSave.customer_id ? { ...customerToSave, isEditing: false } : customer
      ));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCancel = (customerId: string) => {
    setCustomers(customers.map(customer =>
      customer.customer_id === customerId ? { ...customer, isEditing: false } : customer
    ));
    fetchCustomers(); // 元のデータを再取得してリセット
  };

  if (loading) return <p>Loading customers...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center">取引先登録</h1>
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="bg-white shadow-md rounded-lg p-8 mb-8">
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
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600">
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">取引先名</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">正式名称</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">郵便番号</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">住所</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">電話番号</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">メール</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">担当者</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">端数処理</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">締日</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">支払条件</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">請求書発送方法</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">編集</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">削除</th>
                </tr>
              </thead>
              <tbody>
                {customers.map((customer) => (
                  <tr key={customer.customer_id} className="even:bg-gray-100">
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_name}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_name: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_name
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_formalName}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_formalName: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_formalName
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_postalCode}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_postalCode: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_postalCode
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_address}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_address: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_address
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_phone}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_phone: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_phone
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="email"
                          value={customer.customer_mail}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_mail: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_mail
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_contactPerson}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_contactPerson: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_contactPerson
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <select
                          value={customer.customer_rounding}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_rounding: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        >
                          <option>四捨五入</option>
                          <option>切上げ</option>
                          <option>切捨て</option>
                        </select>
                      ) : (
                        customer.customer_rounding
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_closingDay}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_closingDay: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_closingDay
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.customer_paymentTerms}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, customer_paymentTerms: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.customer_paymentTerms
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {customer.isEditing ? (
                        <input
                          type="text"
                          value={customer.invoiceDeliveryMethod}
                          onChange={(e) => setCustomers(customers.map(c => c.customer_id === customer.customer_id ? { ...c, invoiceDeliveryMethod: e.target.value } : c))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        customer.invoiceDeliveryMethod
                      )}
                    </td>
                    <td className="py-1 px-4 text-center border border-gray-300 text-sm">
                      {customer.isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(customer)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mr-1"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => handleCancel(customer.customer_id)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(customer.customer_id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          編集
                        </button>
                      )}
                    </td>
                    <td className="py-1 px-4 text-center border border-gray-300 text-sm">
                      {!customer.isEditing && (
                        <button
                          onClick={() => handleDelete(customer.customer_id)}
                          className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          削除
                        </button>
                      )}
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
