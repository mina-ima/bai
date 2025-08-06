'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { Delivery } from '@/types/delivery';

interface EditableDelivery extends Delivery {
  isEditing?: boolean;
}

export default function DeliveryRegisterPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveries, setDeliveries] = useState<EditableDelivery[]>([]); // Changed to EditableDelivery[]
  const [originalDeliveries, setOriginalDeliveries] = useState<EditableDelivery[]>([]); // Added originalDeliveries
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [errorDeliveries, setErrorDeliveries] = useState<string | null>(null);
  const [deliveryData, setDeliveryData] = useState<Delivery>({
    delivery_id: '',
    product_name: '',
    quantity: 0,
    unit_price: 0,
    delivery_unit: '',
    delivery_note: '',
    delivery_tax: 0,
    delivery_orderId: '',
    delivery_salesGroup: '',
    customer_name: '',
    delivery_number: '',
    delivery_invoiceNumber: '',
    delivery_status: '未',
    delivery_invoiceStatus: '未',

    total_amount: 0,
    delivery_shippingName: '',
    delivery_shippingPostalcode: '',
    delivery_shippingAddress: '',
    delivery_shippingPhone: '',
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
      quantity: 0,
      unit_price: 0,
      delivery_unit: '',
      delivery_tax: 0,
      delivery_note: '',
      delivery_shippingName: '', // 新規追加
      delivery_shippingPostalcode: '', // 新規追加
      delivery_shippingAddress: '', // 新規追加
      delivery_shippingPhone: '', // 新規追加
    }));
  };

  const fetchDeliveries = async () => {
    try {
      setLoadingDeliveries(true);
      const deliveriesRes = await fetch('/api/delivery');
      const deliveriesData: Delivery[] = await deliveriesRes.json();
      // Map to EditableDelivery and set isEditing to false
      const editableDeliveries = deliveriesData.map(d => ({ ...d, isEditing: false }));
      setDeliveries(editableDeliveries);
      setOriginalDeliveries(editableDeliveries); // Store original for cancel
    } catch (error: any) {
      console.error("Failed to fetch deliveries:", error);
      setErrorDeliveries(error.message);
    } finally {
      setLoadingDeliveries(false);
    }
  };

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
        console.log("Fetched Products:", productsData);
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        setErrorDeliveries(error.message);
      }
    };
    fetchInitialData();
    fetchDeliveries(); // Fetch deliveries on initial load
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryData(prevData => ({
      ...prevData,
      [name]: name === 'quantity' || name === 'unit_price' || name === 'delivery_tax' ? parseFloat(value) : value,
    }));
  };

  // New handler for changes in editable table cells
  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    deliveryId: string,
    field: keyof Delivery
  ) => {
    const { value } = e.target;
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.delivery_id === deliveryId
          ? {
              ...delivery,
              [field]:
                field === 'quantity' || field === 'unit_price' || field === 'delivery_tax'
                  ? parseFloat(value)
                  : value,
              total_amount:
                field === 'quantity' || field === 'unit_price'
                  ? (field === 'quantity' ? parseFloat(value) : delivery.quantity) *
                    (field === 'unit_price' ? parseFloat(value) : delivery.unit_price)
                  : delivery.total_amount,
            }
          : delivery
      )
    );
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
          delivery_shippingName: product.product_shippingName, // 新規追加
          delivery_shippingPostalcode: product.product_shippingPostalcode, // 新規追加
          delivery_shippingAddress: product.product_shippingAddress, // 新規追加
          delivery_shippingPhone: product.product_shippingPhone, // 新規追加
        }));
      } else {
        setDeliveryData(prevData => ({
          ...prevData,
          product_name: value,
          unit_price: 0, // Reset if not a product
          delivery_unit: '', // Reset if not a product
          delivery_tax: 0, // Reset if not a product
          delivery_note: '', // Reset if not a product
          delivery_shippingName: '', // 新規追加
          delivery_shippingPostalcode: '', // 新規追加
          delivery_shippingAddress: '', // 新規追加
          delivery_shippingPhone: '', // 新規追加
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
      delivery_shippingName: product.product_shippingName, // 新規追加
      delivery_shippingPostalcode: product.product_shippingPostalcode, // 新規追加
      delivery_shippingAddress: product.product_shippingAddress, // 新規追加
      delivery_shippingPhone: product.product_shippingPhone, // 新規追加
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
          delivery_id: '',
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
          delivery_number: '',
          delivery_invoiceNumber: '',
          delivery_status: '未',
          delivery_invoiceStatus: '未',
          delivery_date: new Date().toISOString().split('T')[0],
          delivery_invoiceDate: '',
          delivery_shippingName: '', // 新規追加
          delivery_shippingPostalcode: '', // 新規追加
          delivery_shippingAddress: '', // 新規追加
          delivery_shippingPhone: '', // 新規追加
        });
        setProductSearchTerm(''); // Reset search term on successful submission
        setShowProductSuggestions(false);
        fetchDeliveries(); // Fetch updated deliveries after successful submission
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
        const response = await fetch(`/api/delivery?delivery_id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('納品データが削除されました。');
          // 納品リストを更新
          const updatedDeliveries = deliveries.filter(delivery => delivery.delivery_id !== id);
          setDeliveries(updatedDeliveries);
          setOriginalDeliveries(updatedDeliveries); // Update original as well
        } else {
          alert('納品データの削除に失敗しました。');
        }
      } catch (error) {
        console.error('Error deleting delivery:', error);
        alert('納品データの削除中にエラーが発生しました。');
      }
    }
  };

  // New handleEdit function
  const handleEdit = (deliveryId: string) => {
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.delivery_id === deliveryId ? { ...delivery, isEditing: true } : delivery
      )
    );
  };

  // New handleSave function
  const handleSave = async (deliveryToSave: EditableDelivery) => {
    try {
      // Remove isEditing before sending to API
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isEditing, ...deliveryDataToSend } = deliveryToSave;
      const response = await fetch(`/api/delivery/${deliveryToSave.delivery_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryDataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      setDeliveries(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery.delivery_id === deliveryToSave.delivery_id ? { ...deliveryToSave, isEditing: false } : delivery
        )
      );
      setOriginalDeliveries(prevOriginal =>
        prevOriginal.map(delivery =>
          delivery.delivery_id === deliveryToSave.delivery_id ? { ...deliveryToSave, isEditing: false } : delivery
        )
      );
      alert('納品データが更新されました。');
    } catch (e: any) {
      setErrorDeliveries(e.message);
      alert(`納品データの更新に失敗しました: ${e.message}`);
    }
  };

  // New handleCancel function
  const handleCancel = (deliveryId: string) => {
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.delivery_id === deliveryId
          ? { ...originalDeliveries.find(d => d.delivery_id === deliveryId)!, isEditing: false }
          : delivery
      )
    );
  };

  const handleIssueDelivery = async (deliveryId: string) => {
    const deliveryToIssue = deliveries.find(d => d.delivery_id === deliveryId);
    if (deliveryToIssue) {
      const updatedDelivery: EditableDelivery = {
        ...deliveryToIssue,
        delivery_status: '済',
        delivery_invoiceStatus: '済',
      };
      await handleSave(updatedDelivery);
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

          {/* 取引先名 */}
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

          {/* 納品品番入力方法 */}
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

          {/* 納品数量、納品単価、金額、納品単位 */}
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

          {/* 納品先名 */}
          <div className="mb-4">
            <label htmlFor="delivery_shippingName" className="block text-gray-700 text-sm font-bold mb-2">納品先名</label>
            <input
              type="text"
              id="delivery_shippingName"
              name="delivery_shippingName"
              value={deliveryData.delivery_shippingName}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* 納品先〒と納品先電話 */}
          <div className="flex flex-wrap -mx-2 mb-4">
            <div className="w-full md:w-1/2 px-2 mb-4 md:mb-0">
              <label htmlFor="delivery_shippingPostalcode" className="block text-gray-700 text-sm font-bold mb-2">納品先〒</label>
              <input
                type="text"
                id="delivery_shippingPostalcode"
                name="delivery_shippingPostalcode"
                value={deliveryData.delivery_shippingPostalcode}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
            <div className="w-full md:w-1/2 px-2">
              <label htmlFor="delivery_shippingPhone" className="block text-gray-700 text-sm font-bold mb-2">納品先電話</label>
              <input
                type="text"
                id="delivery_shippingPhone"
                name="delivery_shippingPhone"
                value={deliveryData.delivery_shippingPhone}
                onChange={handleChange}
                className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
              />
            </div>
          </div>

          {/* 納品先住所 */}
          <div className="mb-4">
            <label htmlFor="delivery_shippingAddress" className="block text-gray-700 text-sm font-bold mb-2">納品先住所</label>
            <input
              type="text"
              id="delivery_shippingAddress"
              name="delivery_shippingAddress"
              value={deliveryData.delivery_shippingAddress}
              onChange={handleChange}
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
          </div>

          {/* 納品備考 (Assuming this was the intended field for the last "納品品番") */}
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
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品先名</th> {/* 新規追加 */}
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品先〒</th> {/* 新規追加 */}
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品先住所</th> {/* 新規追加 */}
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品先電話</th> {/* 新規追加 */}
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
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.delivery_id}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.product_name}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'product_name')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.product_name
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="number"
                        value={delivery.quantity}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'quantity')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.quantity
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="number"
                        value={delivery.unit_price}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'unit_price')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.unit_price
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {/* Total amount is calculated, not directly editable */}
                    {delivery.total_amount.toFixed(2)}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_unit}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_unit')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_unit
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <textarea
                        value={delivery.delivery_note}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_note')}
                        className="w-full p-1 border rounded"
                        rows={2}
                      />
                    ) : (
                      delivery.delivery_note
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="number"
                        value={delivery.delivery_tax}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_tax')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_tax
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_orderId}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_orderId')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_orderId
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_salesGroup}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_salesGroup')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_salesGroup
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <select
                        value={delivery.customer_name}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'customer_name')}
                        className="w-full p-1 border rounded"
                      >
                        {customers.map(customer => (
                          <option key={customer.customer_id} value={customer.customer_name}>
                            {customer.customer_name}
                          </option>
                        ))}
                      </select>
                    ) : (
                      delivery.customer_name
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_shippingName}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingName')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_shippingName
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_shippingPostalcode}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingPostalcode')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_shippingPostalcode
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_shippingAddress}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingAddress')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_shippingAddress
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_shippingPhone}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingPhone')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_shippingPhone
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_number}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_number')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_number
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.delivery_invoiceNumber}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_invoiceNumber')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_invoiceNumber
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <select
                        value={delivery.delivery_status}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_status')}
                        className="w-full p-1 border rounded"
                      >
                        <option value="未">未</option>
                        <option value="済">済</option>
                      </select>
                    ) : (
                      delivery.delivery_status
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <select
                        value={delivery.delivery_invoiceStatus}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_invoiceStatus')}
                        className="w-full p-1 border rounded"
                      >
                        <option value="未">未</option>
                        <option value="済">済</option>
                      </select>
                    ) : (
                      delivery.delivery_invoiceStatus
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="date"
                        value={delivery.delivery_date}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_date')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_date
                    )}
                  </td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="date"
                        value={delivery.delivery_invoiceDate}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_invoiceDate')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_invoiceDate
                    )}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">
                    {delivery.isEditing ? (
                      <>
                        <button
                          onClick={() => handleSave(delivery)}
                          className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mr-1"
                        >
                          保存
                        </button>
                        <button
                          onClick={() => handleCancel(delivery.delivery_id)}
                          className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs"
                        >
                          キャンセル
                        </button>
                      </>
                    ) : (
                      <button
                        onClick={() => handleEdit(delivery.delivery_id)}
                        className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        編集
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">
                    {!delivery.isEditing && (
                      <button
                        onClick={() => handleDeleteDelivery(delivery.delivery_id)}
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        削除
                      </button>
                    )}
                  </td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">
                    {!delivery.isEditing && (
                      <button
                        onClick={() => handleIssueDelivery(delivery.delivery_id)}
                        className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs"
                      >
                        発行
                      </button>
                    )}
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


  
