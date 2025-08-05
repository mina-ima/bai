'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { Delivery } from '@/types/delivery';

export default function DeliveryRegisterPage() {
  // Helper function to convert a number to a Base36 string
  const toBase36 = (num: number): string => {
    return num.toString(36).toUpperCase();
  };

  // Function to generate a unique Base36 ID
  const generateUniqueBase36Id = (): string => {
    const timestamp = Date.now();
    const random = Math.floor(Math.random() * 10000); // Use a larger random range for better uniqueness
    const combined = timestamp + random;

    let base36Id = toBase36(combined);

    // Pad with '0' if less than 6 characters, or truncate if more than 6 characters
    // For 1 billion unique IDs, 6 characters is sufficient (36^6 > 10^9)
    if (base36Id.length < 6) {
      base36Id = '0'.repeat(6 - base36Id.length) + base36Id;
    } else if (base36Id.length > 6) {
      base36Id = base36Id.slice(-6); // Take the last 6 characters
    }
    return base36Id;
  };

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [errorDeliveries, setErrorDeliveries] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState<Delivery>({
    delivery_id: generateUniqueBase36Id(),
    product_name: '',
    quantity: 0,
    unit_price: 0,
    total_amount: 0,
    delivery_unit: '',
    delivery_note: '',
    delivery_tax: 10,
    delivery_orderId: '',
    delivery_salesGroup: '',
    customer_name: '',
    delivery_number: generateUniqueBase36Id(),
    delivery_invoiceNumber: generateUniqueBase36Id(),
    delivery_status: '未',
    delivery_invoiceStatus: '未',
    delivery_date: new Date().toISOString().split('T')[0],
    delivery_invoiceDate: '',
  });

  const [productSearchTerm, setProductSearchTerm] = useState<string>('');
  const [showProductSuggestions, setShowProductSuggestions] = useState<boolean>(false);

  const [inputMode, setInputMode] = useState<'list' | 'free'>('list');

  const handleInputModeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMode(e.target.value as 'list' | 'free');
    setDeliveryData(prevData => ({
      ...prevData,
      product_name: '',
      unit_price: 0,
      delivery_unit: '',
      delivery_tax: 0,
      delivery_note: '',
    }));
  };

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [customersRes, productsRes, deliveriesRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products'),
          fetch('/api/delivery'),
        ]);
        const customersData = await customersRes.json();
        const productsData = await productsRes.json();
        const deliveriesData = await deliveriesRes.json();
        setCustomers(customersData);
        setProducts(productsData);
        setDeliveries(deliveriesData);
        console.log("Fetched Products:", productsData);
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        setErrorDeliveries(error.message);
      } finally {
        setLoadingDeliveries(false);
      }
    };
    fetchInitialData();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryData(prevData => ({
      ...prevData,
      [name]: name === 'quantity' || name === 'unit_price' || name === 'delivery_tax' ? parseFloat(value) : value,
    }));
  };

  const handleCustomerChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setDeliveryData(prevData => ({
      ...prevData,
      customer_name: e.target.value,
    }));
    setProductSearchTerm(''); // Reset product search term
    setShowProductSuggestions(false); // Hide product suggestions
  };

  const handleProductNameChange = (e: React.ChangeEvent<HTMLSelectElement | HTMLInputElement>) => {
    const { value } = e.target;
    if (inputMode === 'list') {
      const product = products.find(p => p.product_name === value);
      if (product) {
        setDeliveryData(prevData => ({
          ...prevData,
          product_name: product.product_name,
          unit_price: product.product_unitPrice,
          delivery_unit: product.product_unit,
          delivery_tax: product.product_tax,
          delivery_note: product.product_note,
        }));
      } else {
        setDeliveryData(prevData => ({
          ...prevData,
          product_name: value,
          unit_price: 0, // Reset if not a product
          delivery_unit: '', // Reset if not a product
          delivery_tax: 0, // Reset if not a product
          delivery_note: '', // Reset if not a product
        }));
      }
    } else if (inputMode === 'free') {
      setDeliveryData(prevData => ({
        ...prevData,
        product_name: value,
      }));
    }
  };

  const handleProductSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductSearchTerm(e.target.value);
    setShowProductSuggestions(true);
  };

  const handleProductSelect = (product: Product) => {
    setDeliveryData(prevData => ({
      ...prevData,
      product_name: product.product_name,
      unit_price: product.product_unitPrice,
      delivery_unit: product.product_unit,
      delivery_tax: product.product_tax,
      delivery_note: product.product_note,
    }));
    setProductSearchTerm(product.product_name);
    setShowProductSuggestions(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch('/api/delivery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryData),
      });

      if (response.ok) {
        alert('納品データを登録しました。');
        // Reset form and generate new IDs for the next entry
        setDeliveryData({
          delivery_id: generateUniqueBase36Id(),
          product_name: '',
          quantity: 0,
          unit_price: 0,
          total_amount: 0,
          delivery_unit: '',
          delivery_note: '',
          delivery_tax: 0,
          delivery_orderId: '',
          delivery_salesGroup: '',
          customer_name: '',
          delivery_number: generateUniqueBase36Id(),
          delivery_invoiceNumber: generateUniqueBase36Id(),
          delivery_status: '未',
          delivery_invoiceStatus: '未',
          delivery_date: new Date().toISOString().split('T')[0],
          delivery_invoiceDate: '',
        });
        setProductSearchTerm(''); // Reset search term on successful submission
        setShowProductSuggestions(false);
      } else {
        throw new Error('Failed to save delivery data');
      }
    } catch (error) {
      console.error(error);
      alert('納品データの登録に失敗しました。');
    }
  };

  const handleDeleteDelivery = async (id: string) => {
    if (confirm(`納品ID: ${id} を削除しますか？`)) {
      try {
        const response = await fetch(`/api/delivery/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('納品データが削除されました。');
          // 納品リストを更新
          const updatedDeliveries = deliveries.filter(delivery => delivery.delivery_id !== id);
          setDeliveries(updatedDeliveries);
        } else {
          alert('納品データの削除に失敗しました。');
        }
      } catch (error) {
        console.error('Error deleting delivery:', error);
        alert('納品データの削除中にエラーが発生しました。');
      }
    }
  };

  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearchTerm = product.product_name.toLowerCase().includes(productSearchTerm.toLowerCase());
      const selectedCustomerName = deliveryData.customer_name.trim().toLowerCase();
      const productCustomerName = product.customer_name ? product.customer_name.trim().toLowerCase() : '';
      const matchesCustomer = selectedCustomerName === '' || productCustomerName === selectedCustomerName;

      return matchesSearchTerm && matchesCustomer;
    })
    .sort((a, b) => a.product_name.localeCompare(b.product_name));

  if (loadingDeliveries) return <p>納品データを読み込み中...</p>;
  if (errorDeliveries) return <p>エラー: {errorDeliveries}</p>;

  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">納品登録</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8">

          

          {/* 1行目: 納品日、納品税区分、注文番号、売上グループ */}
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
              <label htmlFor="delivery_date" className="block text-gray-700 text-sm font-bold mb-2">納品日</label>
              <input
                type="date"
                id="delivery_date"
                name="delivery_date"
                value={deliveryData.delivery_date}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
              <label htmlFor="delivery_tax" className="block text-gray-700 text-sm font-bold mb-2">納品税区分</label>
              <input
                type="number"
                id="delivery_tax"
                name="delivery_tax"
                value={deliveryData.delivery_tax}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
              <label htmlFor="delivery_orderId" className="block text-gray-700 text-sm font-bold mb-2">注文番号</label>
              <input
                type="text"
                id="delivery_orderId"
                name="delivery_orderId"
                value={deliveryData.delivery_orderId}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="w-full md:w-1/4 px-2">
              <label htmlFor="delivery_salesGroup" className="block text-gray-700 text-sm font-bold mb-2">売上グループ</label>
              <input
                type="text"
                id="delivery_salesGroup"
                name="delivery_salesGroup"
                value={deliveryData.delivery_salesGroup}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          {/* 2行目: 取引先名 */}
          <div className="mb-4">
            <label htmlFor="customer_name" className="block text-gray-700 text-sm font-bold mb-2">取引先名</label>
            <select
              id="customer_name"
              name="customer_name"
              value={deliveryData.customer_name}
              onChange={handleCustomerChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            >
              <option value="">取引先を選択してください</option>
              {customers.map(customer => (
                <option key={customer.customer_id} value={customer.customer_name}>
                  {customer.customer_name}
                </option>
              ))}
            </select>
          </div>

          {/* 3行目: 納品品番 (リスト入力と自由入力の選択) */}
          <div className="mb-4">
            <label className="block text-gray-700 text-sm font-bold mb-2">納品品番入力方法</label>
            <div className="flex items-center mb-2">
              <input
                type="radio"
                id="inputModeList"
                name="inputMode"
                value="list"
                checked={inputMode === 'list'}
                onChange={handleInputModeChange}
                className="mr-2"
              />
              <label htmlFor="inputModeList" className="mr-4">リストから選択</label>
              <input
                type="radio"
                id="inputModeFree"
                name="inputMode"
                value="free"
                checked={inputMode === 'free'}
                onChange={handleInputModeChange}
                className="mr-2"
              />
              <label htmlFor="inputModeFree">自由入力</label>
            </div>

            {inputMode === 'list' && (
              <div className="mb-4 relative">
                <label htmlFor="delivery_name_search" className="block text-gray-700 text-sm font-bold mb-2">納品品番 (検索)</label>
                <input
                  type="text"
                  id="delivery_name_search"
                  name="delivery_name_search"
                  value={productSearchTerm}
                  onChange={handleProductSearchChange}
                  onFocus={() => setShowProductSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowProductSuggestions(false), 100)}
                  placeholder="商品名を検索"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
                {showProductSuggestions && (
                  <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                    {filteredAndSortedProducts.length > 0 ? (
                      filteredAndSortedProducts.map(product => (
                        <li
                          key={product.product_id}
                          onMouseDown={() => handleProductSelect(product)}
                          className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                        >
                          {product.product_name}
                        </li>
                      ))
                    ) : (
                      <li className="px-3 py-2 text-gray-500">商品が見つかりません</li>
                    )}
                  </ul>
                )}
              </div>
            )}

            {inputMode === 'free' && (
              <div className="mb-4">
                <label htmlFor="delivery_name_input" className="block text-gray-700 text-sm font-bold mb-2">納品品番 (自由入力)</label>
                <input
                  type="text"
                  id="delivery_name_input"
                  name="product_name"
                  value={deliveryData.product_name}
                  onChange={handleProductNameChange}
                  placeholder="自由入力"
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                />
              </div>
            )}
          </div>

          {/* 4行目: 納品数量、納品単価、（ここで単価掛ける数量の金額）、納品単位 */}
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
              <label htmlFor="quantity" className="block text-gray-700 text-sm font-bold mb-2">納品数量</label>
              <input
                type="number"
                id="quantity"
                name="quantity"
                value={deliveryData.quantity}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
              <label htmlFor="unit_price" className="block text-gray-700 text-sm font-bold mb-2">納品単価</label>
              <input
                type="number"
                id="unit_price"
                name="unit_price"
                value={deliveryData.unit_price}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="w-full md:w-1/4 px-2 mb-4 md:mb-0">
              <label htmlFor="delivery_amount" className="block text-gray-700 text-sm font-bold mb-2">金額</label>
              <input
                type="text"
                id="delivery_amount"
                name="delivery_amount"
                value={(deliveryData.quantity * deliveryData.unit_price).toFixed(2)}
                readOnly
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline bg-gray-100"
              />
            </div>
            <div className="w-full md:w-1/4 px-2">
              <label htmlFor="delivery_unit" className="block text-gray-700 text-sm font-bold mb-2">納品単位</label>
              <input
                type="text"
                id="delivery_unit"
                name="delivery_unit"
                value={deliveryData.delivery_unit}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          {/* 5行目: 納品備考 */}
          <div className="mb-4">
            <label htmlFor="delivery_note" className="block text-gray-700 text-sm font-bold mb-2">納品備考</label>
            <textarea
              id="delivery_note"
              name="delivery_note"
              value={deliveryData.delivery_note}
              onChange={handleChange}
              rows={3}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            ></textarea>
          </div>

          <div className="flex items-center justify-between">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full"
            >
              登録
            </button>
          </div>
        </form>

        <h2 className="text-size-30 font-bold text-center mt-8 mb-4">納品リスト</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600">
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品ID</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品品番</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品数量</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品単価</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">合計金額</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品単位</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品備考</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品税区分</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">注文番号</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">売上グループ</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">取引先名</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品書番号</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">請求書番号</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品書ステータス</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">請求書ステータス</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品日</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">請求日</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">編集</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">削除</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">発行</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.delivery_id} className="even:bg-gray-100">
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_id.slice(-6)}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.product_name}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.quantity}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.unit_price}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.total_amount}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_unit}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_note}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_tax}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_orderId}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_salesGroup}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.customer_name}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_number}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_invoiceNumber}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_status}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_invoiceStatus}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_date}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_invoiceDate}</td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">
                    <button
                      onClick={() => console.log('編集', delivery.delivery_id)}
                      className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      編集
                    </button>
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">
                    <button
                      onClick={() => handleDeleteDelivery(delivery.delivery_id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      削除
                    </button>
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">
                    <button
                      onClick={() => console.log('発行', delivery.delivery_id)}
                      className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                    >
                      発行
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}