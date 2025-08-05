
'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { DeliveryItem } from '@/types/delivery';

export default function DeliveryRegisterPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [deliveryDate, setDeliveryDate] = useState<string>(
    new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<DeliveryItem[]>([]);
  const [selectedProductId, setSelectedProductId] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersRes, productsRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products'),
        ]);
        const customersData = await customersRes.json();
        const productsData = await productsRes.json();
        setCustomers(customersData);
        setProducts(productsData);
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();
  }, []);

  const handleAddItem = () => {
    const product = products.find(p => p.product_id === selectedProductId);
    if (product) {
      const newItem: DeliveryItem = {
        product_id: product.product_id,
        product_name: product.product_name,
        quantity: quantity,
        unit_price: product.product_unitPrice,
        total_price: product.product_unitPrice * quantity,
      };
      setItems([...items, newItem]);
      setSelectedProductId('');
      setQuantity(1);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId || items.length === 0) {
      alert('顧客と商品を少なくとも1つ選択してください。');
      return;
    }

    const customer = customers.find(c => c.customer_id === selectedCustomerId);
    const totalAmount = items.reduce((acc, item) => acc + item.total_price, 0);

    const newDelivery = {
      customer_id: selectedCustomerId,
      customer_name: customer?.customer_name || '',
      delivery_date: deliveryDate,
      items: items,
      total_amount: totalAmount,
      status: 'pending',
    };

    try {
      const response = await fetch('/api/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newDelivery),
      });

      if (response.ok) {
        alert('納品データを登録しました。');
        setSelectedCustomerId('');
        setDeliveryDate(new Date().toISOString().split('T')[0]);
        setItems([]);
      } else {
        throw new Error('Failed to save delivery data');
      }
    } catch (error) {
      console.error(error);
      alert('納品データの登録に失敗しました。');
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">納品登録</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-4">
            <label htmlFor="customer" className="block text-gray-700 text-sm font-bold mb-2">顧客</label>
            <select
              id="customer"
              value={selectedCustomerId}
              onChange={(e) => setSelectedCustomerId(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">顧客を選択してください</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_id}>
                  {customer.customer_name}
                </option>
              ))}
            </select>
          </div>

          <div className="mb-4">
            <label htmlFor="deliveryDate" className="block text-gray-700 text-sm font-bold mb-2">納品日</label>
            <input
              type="date"
              id="deliveryDate"
              value={deliveryDate}
              onChange={(e) => setDeliveryDate(e.target.value)}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          <div className="mb-4 border-t pt-4">
            <h2 className="text-xl font-bold mb-2">商品追加</h2>
            <div className="flex items-center space-x-4">
              <div className="flex-grow">
                <label htmlFor="product" className="block text-gray-700 text-sm font-bold mb-2">商品</label>
                <select
                  id="product"
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(e.target.value)}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                >
                  <option value="">商品を選択してください</option>
                  {products.map(product => (
                    <option key={product.product_id} value={product.product_id}>
                      {product.product_name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">数量</label>
                <input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value, 10))}
                  min="1"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
              <button
                type="button"
                onClick={handleAddItem}
                className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline self-end"
              >
                追加
              </button>
            </div>
          </div>

          <div className="mb-4 border-t pt-4">
            <h2 className="text-xl font-bold mb-2">納品リスト</h2>
            <table className="min-w-full">
              <thead>
                <tr>
                  <th className="px-4 py-2">商品名</th>
                  <th className="px-4 py-2">数量</th>
                  <th className="px-4 py-2">単価</th>
                  <th className="px-4 py-2">合計</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, index) => (
                  <tr key={index}>
                    <td className="border px-4 py-2">{item.product_name}</td>
                    <td className="border px-4 py-2">{item.quantity}</td>
                    <td className="border px-4 py-2">{item.unit_price}</td>
                    <td className="border px-4 py-2">{item.total_price}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-center mt-4">
            <button
              className="w-full py-4 px-8 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 text-2xl"
              type="submit"
            >
              登録
            </button>
          </div>
        </form>
      </div>
    </AuthenticatedLayout>
  );
}
