'use client';

import { useEffect, useState } from 'react';
import { Product } from '@/types/product';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface Customer {
  customer_id: string;
  customer_name: string;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]); // 取引先リスト
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState<Omit<Product, 'product_id'>>({
    product_name: '',
    product_shippingName: '',
    product_shippingPostalcode: '',
    product_shippingAddress: '',
    product_shippingPhone: '',
    product_tax: 0,
    product_unit: '',
    product_unitPrice: 0,
    product_note: '',
    customer_name: '', // 新しい項目
  });

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setProducts(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCustomers(data);
    } catch (e: any) {
      console.error('Error fetching customers:', e);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCustomers(); // 取引先リストも取得
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewProduct((prev) => ({
      ...prev,
      [name]: name === 'product_tax' || name === 'product_unitPrice' ? parseInt(value) : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('/api/products', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newProduct),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setNewProduct({
        product_name: '',
        product_shippingName: '',
        product_shippingPostalcode: '',
        product_shippingAddress: '',
        product_shippingPhone: '',
        product_tax: 0,
        product_unit: '',
        product_unitPrice: 0,
        product_note: '',
        customer_name: '',
      });
      fetchProducts(); // 登録後にリストを更新
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleDelete = async (productId: string) => {
    if (window.confirm('この商品を削除してもよろしいですか？')) {
      try {
        const response = await fetch(`/api/products/${productId}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        fetchProducts(); // 削除後にリストを更新
      } catch (e: any) {
        setError(e.message);
      }
    }
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AuthenticatedLayout>
      <div className="w-4/5 mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center">商品登録</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 mb-8">
          {/* Row 1: Customer & Product Name */}
          <div className="mb-2 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="customer_name">
                取引先名：
              </label>
              <select
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="customer_name"
                name="customer_name"
                value={newProduct.customer_name}
                onChange={handleChange}
                required
              >
                <option value="">選択してください</option>
                {customers.map((customer) => (
                  <option key={customer.customer_id} value={customer.customer_name}>
                    {customer.customer_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_name">
                商品名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_name"
                type="text"
                name="product_name"
                value={newProduct.product_name}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 2: Postal Code & Shipping Name */}
          <div className="mb-2 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_shippingPostalcode">
                発送先〒：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_shippingPostalcode"
                type="text"
                name="product_shippingPostalcode"
                value={newProduct.product_shippingPostalcode}
                onChange={handleChange}
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_shippingName">
                発送先名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_shippingName"
                type="text"
                name="product_shippingName"
                value={newProduct.product_shippingName}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3: Shipping Address (Full Width) */}
          <div className="mb-2 flex items-center">
            <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_shippingAddress">
              発送先住所：
            </label>
            <input
              className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              id="product_shippingAddress"
              type="text"
              name="product_shippingAddress"
              value={newProduct.product_shippingAddress}
              onChange={handleChange}
            />
          </div>

          {/* Row 4: Phone, Unit, Price, Tax */}
          <div className="mb-2 flex space-x-4">
            <div className="w-[40%] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_shippingPhone">
                発送先電話：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_shippingPhone"
                type="text"
                name="product_shippingPhone"
                value={newProduct.product_shippingPhone}
                onChange={handleChange}
              />
            </div>
            <div className="w-[20%] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_unit">
                単位：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_unit"
                type="text"
                name="product_unit"
                value={newProduct.product_unit}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-[20%] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_unitPrice">
                単価：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_unitPrice"
                type="number"
                name="product_unitPrice"
                value={newProduct.product_unitPrice}
                onChange={handleChange}
                required
              />
            </div>
            <div className="w-[20%] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_tax">
                税区分：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="product_tax"
                type="number"
                name="product_tax"
                value={newProduct.product_tax}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {/* Row 5: Notes (Full Width) */}
          <div className="mb-2 flex items-center">
            <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="product_note">
              商品備考：
            </label>
            <textarea
              className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              id="product_note"
              name="product_note"
              value={newProduct.product_note}
              onChange={handleChange}
            ></textarea>
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

        <h2 className="text-size-30 font-bold text-center mt-[50px]">商品リスト</h2>
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border-[3px] border-blue-600">
              <thead>
                <tr>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">商品名</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">単価</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">単位</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">税</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">発送先名</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">発送先〒</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">発送先住所</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">発送先電話</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-left border-[3px] border-blue-600">備考</th>
                  <th className="py-3 px-4 bg-blue-600 text-white font-bold uppercase text-sm text-center border-[3px] border-blue-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} className="even:bg-gray-50 hover:bg-gray-100">
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{product.product_name}</td>
                    <td className="py-2 px-4 text-right border-[3px] border-blue-600 text-sm">{product.product_unitPrice}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{product.product_unit}</td>
                    <td className="py-2 px-4 text-right border-[3px] border-blue-600 text-sm">{product.product_tax}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{product.product_shippingName}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{product.product_shippingPostalcode}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{product.product_shippingAddress}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{product.product_shippingPhone}</td>
                    <td className="py-2 px-4 text-left border-[3px] border-blue-600 text-sm">{product.product_note}</td>
                    <td className="py-2 px-4 text-center border-[3px] border-blue-600 text-sm">
                      <button
                        onClick={() => handleDelete(product.product_id)}
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
