'use client';

import { useEffect, useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface EditableProduct extends Product {
  isEditing?: boolean;
}

export default function ProductsPage() {
  const [products, setProducts] = useState<EditableProduct[]>([]);
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
      [name]: name === 'product_tax' || name === 'product_unitPrice' ? parseFloat(value) : value,
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

  const handleEdit = (productId: string) => {
    setProducts(products.map(product =>
      product.product_id === productId ? { ...product, isEditing: true } : product
    ));
  };

  const handleSave = async (productToSave: Product & { isEditing?: boolean }) => {
    try {
      const response = await fetch(`/api/products/${productToSave.product_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(productToSave),
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setProducts(products.map(product =>
        product.product_id === productToSave.product_id ? { ...productToSave, isEditing: false } : product
      ));
    } catch (e: any) {
      setError(e.message);
    }
  };

  const handleCancel = (productId: string) => {
    setProducts(products.map(product =>
      product.product_id === productId ? { ...product, isEditing: false } : product
    ));
    fetchProducts(); // 元のデータを再取得してリセット
  };

  if (loading) return <p>Loading products...</p>;
  if (error) return <p>Error: {error}</p>;

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center">商品登録</h1>
        <form onSubmit={handleSubmit} onKeyDown={(e) => { if (e.key === 'Enter') e.preventDefault(); }} className="bg-white shadow-md rounded-lg p-8 mb-8">
          {/* Row 1: Customer & Product Name */}
          <div className="mb-2 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="customer_name">
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
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="product_name">
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
          <div className="mb-2 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="product_shippingPostalcode">
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
            <div className="flex-1 min-w-[300px] flex items-center gap-2">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="product_shippingName">
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
          <div className="mb-2 flex flex-wrap items-center gap-4">
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
          <div className="flex flex-col md:flex-row gap-4 mb-4">
            {/* Shipping Phone */}
            <div className="flex-1">
              <label htmlFor="product_shippingPhone" className="block text-gray-700 text-size-20 font-medium mb-2">
                発送先電話：
              </label>
              <input
                id="product_shippingPhone"
                type="text"
                name="product_shippingPhone"
                value={newProduct.product_shippingPhone}
                onChange={handleChange}
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>

            {/* Unit */}
            <div className="flex-1">
              <label htmlFor="product_unit" className="block text-gray-700 text-size-20 font-medium mb-2">
                単位：
              </label>
              <input
                id="product_unit"
                type="text"
                name="product_unit"
                value={newProduct.product_unit}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>

            {/* Unit Price */}
            <div className="flex-1">
              <label htmlFor="product_unitPrice" className="block text-gray-700 text-size-20 font-medium mb-2">
                単価：
              </label>
              <input
                id="product_unitPrice"
                type="number"
                step="any"
                name="product_unitPrice"
                value={newProduct.product_unitPrice}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>

            {/* Tax */}
            <div className="flex-1">
              <label htmlFor="product_tax" className="block text-gray-700 text-size-20 font-medium mb-2">
                税区分：
              </label>
              <input
                id="product_tax"
                type="number"
                name="product_tax"
                value={newProduct.product_tax}
                onChange={handleChange}
                required
                className="w-full p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
              />
            </div>
          </div>

          {/* Row 5: Notes (Full Width) */}
          <div className="mb-2 flex flex-wrap items-center gap-4">
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
            <table className="min-w-full border-collapse border border-gray-300">
              <thead>
                <tr className="bg-blue-600">
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">商品名</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">単価</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">単位</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">税</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">発送先名</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">発送先〒</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">発送先住所</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">発送先電話</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">備考</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">編集</th>
                  <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">削除</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.product_id} className="even:bg-gray-100">
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_name}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_name: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_name
                      )}
                    </td>
                    <td className="py-1 px-4 text-right border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="number"
                          step="any"
                          value={product.product_unitPrice}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_unitPrice: parseFloat(e.target.value) } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_unitPrice
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_unit}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_unit: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_unit
                      )}
                    </td>
                    <td className="py-1 px-4 text-right border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="number"
                          value={product.product_tax}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_tax: parseInt(e.target.value) } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_tax
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingName}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingName: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingName
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingPostalcode}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingPostalcode: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingPostalcode
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingAddress}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingAddress: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingAddress
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <input
                          type="text"
                          value={product.product_shippingPhone}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_shippingPhone: e.target.value } : p))}
                          className="w-full p-1 border rounded"
                        />
                      ) : (
                        product.product_shippingPhone
                      )}
                    </td>
                    <td className="py-1 px-4 text-left border border-gray-300 text-sm whitespace-nowrap">
                      {product.isEditing ? (
                        <textarea
                          value={product.product_note}
                          onChange={(e) => setProducts(products.map(p => p.product_id === product.product_id ? { ...p, product_note: e.target.value } : p))}
                          className="w-full p-1 border rounded h-auto"
                          rows={3}
                        />
                      ) : (
                        product.product_note
                      )}
                    </td>
                    <td className="py-1 px-4 text-center border border-gray-300 text-sm">
                      {product.isEditing ? (
                        <>
                          <button
                            onClick={() => handleSave(product)}
                            className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mr-1"
                          >
                            保存
                          </button>
                          <button
                            onClick={() => handleCancel(product.product_id)}
                            className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
                          >
                            キャンセル
                          </button>
                        </>
                      ) : (
                        <button
                          onClick={() => handleEdit(product.product_id)}
                          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          編集
                        </button>
                      )}
                    </td>
                    <td className="py-1 px-4 text-center border border-gray-300 text-sm">
                      {!product.isEditing && (
                        <button
                          onClick={() => handleDelete(product.product_id)}
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
