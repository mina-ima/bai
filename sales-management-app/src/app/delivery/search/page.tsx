'use client';

import { useState, useEffect, useCallback } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { Delivery } from '@/types/delivery';
import { DeliveryNotePdfProps } from '@/components/DeliveryNotePdf';

interface EditableDelivery extends Delivery {
  isEditing?: boolean;
}

interface CompanyInfo {
  company_name: string;
  company_postalCode: string;
  company_address: string;
  company_phone: string;
  company_fax: string;
  company_mail: string;
  company_contactPerson: string;
  company_bankName: string;
  company_bankBranch: string;
  company_bankType: string;
  company_bankNumber: string;
  company_bankHolder: string;
  company_invoiceNumber: string;
}

// generateNextId 関数をコンポーネントの外に移動
const generateNextId = (prefix: string, existingData: Delivery[], idField: keyof Delivery): string => {
  let maxIdNum = 0;
  const regex = new RegExp(`^${prefix}(\d{9})$`);
  for (const data of existingData) {
    const currentId = data[idField] as string;
    const match = currentId.match(regex);
    if (match) {
      const idNum = parseInt(match[1], 10);
      if (!isNaN(idNum) && idNum > maxIdNum) {
        maxIdNum = idNum;
      }
    }
  }
  const nextIdNum = maxIdNum + 1;
  const paddedId = String(nextIdNum).padStart(9, '0');
  return prefix + paddedId;
};

export default function DeliverySearchPage() {
  const [deliveries, setDeliveries] = useState<EditableDelivery[]>([]);
  const [allDeliveries, setAllDeliveries] = useState<Delivery[]>([]); // 全納品データを保持
  const [originalDeliveries, setOriginalDeliveries] = useState<EditableDelivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  const [selectedDeliveries, setSelectedDeliveries] = useState<string[]>([]); // 選択された納品IDの配列

  // States for incremental search suggestions
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [filteredCustomerSuggestions, setFilteredCustomerSuggestions] = useState<string[]>([]);

  const [showProductSuggestions, setShowProductSuggestions] = useState(false);
  const [filteredProductSuggestions, setFilteredProductSuggestions] = useState<string[]>([]);

  const [showShippingNameSuggestions, setShowShippingNameSuggestions] = useState(false);
  const [filteredShippingNameSuggestions, setFilteredShippingNameSuggestions] = useState<string[]>([]);

  const [showOrderIdSuggestions, setShowOrderIdSuggestions] = useState(false);
  const [filteredOrderIdSuggestions, setFilteredOrderIdSuggestions] = useState<string[]>([]);

  const [showSalesGroupSuggestions, setShowSalesGroupSuggestions] = useState(false);
  const [filteredSalesGroupSuggestions, setFilteredSalesGroupSuggestions] = useState<string[]>([]);

  const [showDeliveryNoteSuggestions, setShowDeliveryNoteSuggestions] = useState(false);
  const [filteredDeliveryNoteSuggestions, setFilteredDeliveryNoteSuggestions] = useState<string[]>([]);

  const [searchParams, setSearchParams] = useState({
    delivery_id: '',
    product_name: '',
    quantity_from: '',
    quantity_to: '',
    unit_price_from: '',
    unit_price_to: '',
    total_amount_from: '',
    total_amount_to: '',
    delivery_note: '',
    delivery_tax: '',
    delivery_orderId: '',
    delivery_salesGroup: '',
    customer_name: '',
    delivery_shippingName: '',
    delivery_number: '',
    delivery_invoiceNumber: '',
    delivery_status: '',
    delivery_invoiceStatus: '',
    delivery_date_from: '',
    delivery_date_to: '',
    delivery_invoiceDate_from: '',
    delivery_invoiceDate_to: '',
  });

  const fetchDeliveries = useCallback(async (params: typeof searchParams) => {
    setLoading(true);
    setError(null);
    try {
      const query = new URLSearchParams(params as Record<string, string>).toString();
      const response = await fetch(`/api/delivery?${query}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Delivery[] = await response.json();
      setAllDeliveries(data); // Store all fetched data
      const editableDeliveries = data.map(d => ({ ...d, isEditing: false }));
      setDeliveries(editableDeliveries);
      setOriginalDeliveries(editableDeliveries);
    } catch (e: any) {
      console.error("Failed to fetch deliveries:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setSearchParams(prev => ({ ...prev, [name]: value }));

    // インクリメンタルサーチの候補を生成
    const filterSuggestions = (field: keyof Delivery, setter: React.Dispatch<React.SetStateAction<string[]>>) => {
      if (value.length > 0) {
        const uniqueValues = Array.from(new Set(allDeliveries
          .map(d => String(d[field]))
          .filter(item => item.toLowerCase().includes(value.toLowerCase()))
        )).sort((a, b) => a.localeCompare(b));
        setter(uniqueValues);
      } else {
        setter([]);
      }
    };

    switch (name) {
      case 'customer_name':
        filterSuggestions('customer_name', setFilteredCustomerSuggestions);
        setShowCustomerSuggestions(true);
        break;
      case 'product_name':
        filterSuggestions('product_name', setFilteredProductSuggestions);
        setShowProductSuggestions(true);
        break;
      case 'delivery_shippingName':
        filterSuggestions('delivery_shippingName', setFilteredShippingNameSuggestions);
        setShowShippingNameSuggestions(true);
        break;
      case 'delivery_orderId':
        filterSuggestions('delivery_orderId', setFilteredOrderIdSuggestions);
        setShowOrderIdSuggestions(true);
        break;
      case 'delivery_salesGroup':
        filterSuggestions('delivery_salesGroup', setFilteredSalesGroupSuggestions);
        setShowSalesGroupSuggestions(true);
        break;
      case 'delivery_note':
        filterSuggestions('delivery_note', setFilteredDeliveryNoteSuggestions);
        setShowDeliveryNoteSuggestions(true);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    // コンポーネントマウント時に一度だけデータをフェッチ
    const fetchInitialData = async () => {
      try {
        const [customersRes, productsRes, companyInfoRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products'),
          fetch('/data/company_info.json'),
        ]);
        const customersData = await customersRes.json();
        const productsData = await productsRes.json();
        const companyData = await companyInfoRes.json();
        setCustomers(customersData);
        setCompanyInfo(companyData);
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
      }
    };
    fetchInitialData();
    fetchDeliveries(searchParams);
  }, []);

  const handleEditChange = useCallback(( 
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
                field === 'quantity' || field === 'unit_price' || field === 'delivery_tax' || field === 'total_amount'
                  ? parseFloat(value)
                  : value,
              total_amount:
                (field === 'quantity' || field === 'unit_price')
                  ? (field === 'quantity' ? parseFloat(value) : delivery.quantity) *
                    (field === 'unit_price' ? parseFloat(value) : delivery.unit_price)
                  : delivery.total_amount,
            }
          : delivery
      )
    );
  }, []);

  const handleSave = useCallback(async (deliveryToSave: EditableDelivery): Promise<Delivery> => {
    try {
      const { isEditing, ...deliveryDataToSend } = deliveryToSave;
      const response = await fetch(`/api/delivery?delivery_id=${deliveryToSave.delivery_id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(deliveryDataToSend),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedDelivery: Delivery = await response.json();

      setDeliveries(prevDeliveries =>
        prevDeliveries.map(delivery =>
          delivery.delivery_id === savedDelivery.delivery_id ? { ...savedDelivery, isEditing: false } : delivery
        )
      );
      setOriginalDeliveries(prevOriginal =>
        prevOriginal.map(delivery =>
          delivery.delivery_id === savedDelivery.delivery_id ? { ...savedDelivery, isEditing: false } : delivery
        )
      );
      
      return savedDelivery;
    } catch (e: any) {
      setError(e.message);
      alert(`納品データの更新に失敗しました: ${e.message}`);
      throw e;
    }
  }, []);

  const handleEdit = useCallback((deliveryId: string) => {
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.delivery_id === deliveryId ? { ...delivery, isEditing: true } : delivery
      )
    );
  }, []);

  const handleCancel = useCallback((deliveryId: string) => {
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.delivery_id === deliveryId
          ? { ...originalDeliveries.find(d => d.delivery_id === deliveryId)!, isEditing: false } 
          : delivery
      )
    );
  }, [originalDeliveries]);

  const handleSelectSuggestion = (name: keyof typeof searchParams, value: string, setter: React.Dispatch<React.SetStateAction<boolean>>) => {
    setSearchParams(prev => ({ ...prev, [name]: value }));
    setter(false);
  };

  const handleSelectCustomerSuggestion = (value: string) => handleSelectSuggestion('customer_name', value, setShowCustomerSuggestions);
  const handleSelectProductSuggestion = (value: string) => handleSelectSuggestion('product_name', value, setShowProductSuggestions);
  const handleSelectShippingNameSuggestion = (value: string) => handleSelectSuggestion('delivery_shippingName', value, setShowShippingNameSuggestions);
  const handleSelectOrderIdSuggestion = (value: string) => handleSelectSuggestion('delivery_orderId', value, setShowOrderIdSuggestions);
  const handleSelectSalesGroupSuggestion = (value: string) => handleSelectSuggestion('delivery_salesGroup', value, setShowSalesGroupSuggestions);
  const handleSelectDeliveryNoteSuggestion = (value: string) => handleSelectSuggestion('delivery_note', value, setShowDeliveryNoteSuggestions);

  const handleDeleteDelivery = useCallback(async (id: string) => {
    if (confirm(`納品ID: ${id} を削除しますか？`)) {
      try {
        const response = await fetch(`/api/delivery?delivery_id=${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('納品データが削除されました。');
          fetchDeliveries(searchParams); // 削除後にリストを再フェッチ
        } else {
          alert('納品データの削除に失敗しました。');
        }
      } catch (error) {
        console.error('Error deleting delivery:', error);
        alert('納品データの削除中にエラーが発生しました。');
      }
    }
  }, [fetchDeliveries]);

  const handleCheckboxChange = (deliveryId: string) => {
    setSelectedDeliveries(prevSelected =>
      prevSelected.includes(deliveryId)
        ? prevSelected.filter(id => id !== deliveryId)
        : [...prevSelected, deliveryId]
    );
  };

  const handleSelectAllChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedDeliveries(deliveries.map(delivery => delivery.delivery_id));
    } else {
      setSelectedDeliveries([]);
    }
  };

  const handleBulkIssueDelivery = async () => {
    if (selectedDeliveries.length === 0) {
      alert('納品書を発行する納品データを選択してください。');
      return;
    }

    if (!companyInfo) {
      alert('会社情報が読み込まれていません。');
      return;
    }

    const deliveriesToIssue = selectedDeliveries.map(id => deliveries.find(d => d.delivery_id === id)!);

    // 既に発行済みの納品データがないかチェックし、共通の納品書番号を特定
    const issuedDeliveries = deliveriesToIssue.filter(d => d.delivery_status === '済');

    let commonDeliveryNumber: string | undefined = undefined;
    if (issuedDeliveries.length > 0) {
      const uniqueIssuedNumbers = new Set(issuedDeliveries.map(d => d.delivery_number).filter(Boolean));
      if (uniqueIssuedNumbers.size > 1) {
        alert(`選択された納品データの中に、異なる納品書番号で発行済みのものが含まれています。再発行できません。`);
        return;
      }
      if (uniqueIssuedNumbers.size === 1) {
        commonDeliveryNumber = uniqueIssuedNumbers.values().next().value;
      }
    }

    // 新しい納品書番号が必要か、または既存の共通納品書番号を使用するか
    let bulkDeliveryNumber: string | undefined = commonDeliveryNumber;
    const needsNewNumber = deliveriesToIssue.some(d => !d.delivery_number);

    if (needsNewNumber && !bulkDeliveryNumber) {
      try {
        const response = await fetch('/api/delivery');
        const allCurrentDeliveries: Delivery[] = await response.json();
        bulkDeliveryNumber = generateNextId('DN', allCurrentDeliveries, 'delivery_number');
      } catch (error) {
        console.error('Failed to generate new delivery number:', error);
        alert('納品書番号の生成に失敗しました。');
        return;
      }
    }

    // 納品書番号を更新したデータを作成
    const updatedDeliveriesForPdf = deliveriesToIssue.map(d => ({
      ...d,
      delivery_number: d.delivery_number || bulkDeliveryNumber || '', // 既に番号がある場合はそれを維持、なければ新しく生成された番号を適用、それでもundefinedなら空文字列
    }));

    // DeliveryオブジェクトをDeliveryItemオブジェクトに変換
    const deliveryItemsForPdf = updatedDeliveriesForPdf.map(delivery => ({
      productCode: delivery.product_name,
      quantity: delivery.quantity,
      unit: delivery.delivery_unit,
      unitPrice: delivery.unit_price,
      remarks: delivery.delivery_note,
    }));

    try {
      const response = await fetch('/api/delivery/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveries: deliveryItemsForPdf,
          companyInfo: companyInfo,
          customers: customers, // 顧客情報もAPIに渡す
          deliveryNoteNumber: bulkDeliveryNumber || '未設定', // 一括納品書番号を明示的に渡す
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `納品書_一括_${new Date().toISOString().split('T')[0]}.pdf`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('一括納品書を生成しました。');

        // PDF生成成功後、納品ステータスを更新
        for (const delivery of updatedDeliveriesForPdf) {
          await handleSave({ ...delivery, delivery_status: '済' });
        }

        setSelectedDeliveries([]); // 選択をクリア
        fetchDeliveries(searchParams); // リストを再フェッチして最新の状態を反映

      } else {
        const errorText = await response.text();
        console.error('Failed to generate bulk PDF:', response.statusText, errorText);
        alert('一括納品書生成に失敗しました。詳細をコンソールで確認してください。');
      }
    } catch (error) {
      console.error('Error generating bulk PDF or updating delivery status:', error);
      alert('一括納品書生成またはデータ更新中にエラーが発生しました。');
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    fetchDeliveries(searchParams);
  }, [fetchDeliveries, searchParams]);

  if (loading) return <p>読み込み中...</p>;
  if (error) return <p>エラー: {error}</p>;

  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">納品検索</h1>

        {/* 検索フォーム */}
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* 納品書番号 */}
            <div>
              <label htmlFor="delivery_number" className="block text-gray-700 text-sm font-bold mb-2">納品書番号</label>
              <input
                type="text"
                id="delivery_number"
                name="delivery_number"
                value={searchParams.delivery_number}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>
            {/* 納品日 (From/To) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品日</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  id="delivery_date_from"
                  name="delivery_date_from"
                  value={searchParams.delivery_date_from}
                  onChange={handleSearchChange}
                  placeholder="From"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
                <input
                  type="date"
                  id="delivery_date_to"
                  name="delivery_date_to"
                  value={searchParams.delivery_date_to}
                  onChange={handleSearchChange}
                  placeholder="To"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
              </div>
            </div>
            {/* 納品書ステータス */}
            <div>
              <label htmlFor="delivery_status" className="block text-gray-700 text-sm font-bold mb-2">納品書ステータス</label>
              <select
                id="delivery_status"
                name="delivery_status"
                value={searchParams.delivery_status}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              >
                <option value="">全て</option>
                <option value="未">未</option>
                <option value="済">済</option>
              </select>
            </div>
            {/* 取引先名 */}
            <div className="relative">
              <label htmlFor="customer_name" className="block text-gray-700 text-sm font-bold mb-2">取引先名</label>
              <input
                type="text"
                id="customer_name"
                name="customer_name"
                value={searchParams.customer_name}
                onChange={handleSearchChange}
                onFocus={() => setShowCustomerSuggestions(true)}
                onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 100)}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
              {showCustomerSuggestions && filteredCustomerSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredCustomerSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onMouseDown={() => handleSelectCustomerSuggestion(suggestion)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* 納品品番 */}
            <div className="relative">
              <label htmlFor="product_name" className="block text-gray-700 text-sm font-bold mb-2">納品品番</label>
              <input
                type="text"
                id="product_name"
                name="product_name"
                value={searchParams.product_name}
                onChange={handleSearchChange}
                onFocus={() => setShowProductSuggestions(true)}
                onBlur={() => setTimeout(() => setShowProductSuggestions(false), 100)}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
              {showProductSuggestions && filteredProductSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredProductSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onMouseDown={() => handleSelectProductSuggestion(suggestion)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* 納品先名 */}
            <div className="relative">
              <label htmlFor="delivery_shippingName" className="block text-gray-700 text-sm font-bold mb-2">納品先名</label>
              <input
                type="text"
                id="delivery_shippingName"
                name="delivery_shippingName"
                value={searchParams.delivery_shippingName}
                onChange={handleSearchChange}
                onFocus={() => setShowShippingNameSuggestions(true)}
                onBlur={() => setTimeout(() => setShowShippingNameSuggestions(false), 100)}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
              {showShippingNameSuggestions && filteredShippingNameSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredShippingNameSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onMouseDown={() => handleSelectShippingNameSuggestion(suggestion)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* 納品数量 (From/To) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品数量</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  id="quantity_from"
                  name="quantity_from"
                  value={searchParams.quantity_from}
                  onChange={handleSearchChange}
                  placeholder="From"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
                <input
                  type="number"
                  id="quantity_to"
                  name="quantity_to"
                  value={searchParams.quantity_to}
                  onChange={handleSearchChange}
                  placeholder="To"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
              </div>
            </div>
            {/* 納品単価 (From/To) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品単価</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  id="unit_price_from"
                  name="unit_price_from"
                  value={searchParams.unit_price_from}
                  onChange={handleSearchChange}
                  placeholder="From"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
                <input
                  type="number"
                  id="unit_price_to"
                  name="unit_price_to"
                  value={searchParams.unit_price_to}
                  onChange={handleSearchChange}
                  placeholder="To"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
              </div>
            </div>
            {/* 合計金額 (From/To) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">合計金額</label>
              <div className="flex space-x-2">
                <input
                  type="number"
                  id="total_amount_from"
                  name="total_amount_from"
                  value={searchParams.total_amount_from}
                  onChange={handleSearchChange}
                  placeholder="From"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
                <input
                  type="number"
                  id="total_amount_to"
                  name="total_amount_to"
                  value={searchParams.total_amount_to}
                  onChange={handleSearchChange}
                  placeholder="To"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
              </div>
            </div>
            {/* 請求書番号 */}
            <div>
              <label htmlFor="delivery_invoiceNumber" className="block text-gray-700 text-sm font-bold mb-2">請求書番号</label>
              <input
                type="text"
                id="delivery_invoiceNumber"
                name="delivery_invoiceNumber"
                value={searchParams.delivery_invoiceNumber}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>
            {/* 請求日 (From/To) */}
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">請求日</label>
              <div className="flex space-x-2">
                <input
                  type="date"
                  id="delivery_invoiceDate_from"
                  name="delivery_invoiceDate_from"
                  value={searchParams.delivery_invoiceDate_from}
                  onChange={handleSearchChange}
                  placeholder="From"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
                <input
                  type="date"
                  id="delivery_invoiceDate_to"
                  name="delivery_invoiceDate_to"
                  value={searchParams.delivery_invoiceDate_to}
                  onChange={handleSearchChange}
                  placeholder="To"
                  className="shadow appearance-none border rounded w-1/2 py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
                />
              </div>
            </div>
            {/* 請求書ステータス */}
            <div>
              <label htmlFor="delivery_invoiceStatus" className="block text-gray-700 text-sm font-bold mb-2">請求書ステータス</label>
              <select
                id="delivery_invoiceStatus"
                name="delivery_invoiceStatus"
                value={searchParams.delivery_invoiceStatus}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              >
                <option value="">全て</option>
                <option value="未">未</option>
                <option value="済">済</option>
              </select>
            </div>
            {/* 注文番号 */}
            <div className="relative">
              <label htmlFor="delivery_orderId" className="block text-gray-700 text-sm font-bold mb-2">注文番号</label>
              <input
                type="text"
                id="delivery_orderId"
                name="delivery_orderId"
                value={searchParams.delivery_orderId}
                onChange={handleSearchChange}
                onFocus={() => setShowOrderIdSuggestions(true)}
                onBlur={() => setTimeout(() => setShowOrderIdSuggestions(false), 100)}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
              {showOrderIdSuggestions && filteredOrderIdSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredOrderIdSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onMouseDown={() => handleSelectOrderIdSuggestion(suggestion)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* 売上グループ */}
            <div className="relative">
              <label htmlFor="delivery_salesGroup" className="block text-gray-700 text-sm font-bold mb-2">売上グループ</label>
              <input
                type="text"
                id="delivery_salesGroup"
                name="delivery_salesGroup"
                value={searchParams.delivery_salesGroup}
                onChange={handleSearchChange}
                onFocus={() => setShowSalesGroupSuggestions(true)}
                onBlur={() => setTimeout(() => setShowSalesGroupSuggestions(false), 100)}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
              {showSalesGroupSuggestions && filteredSalesGroupSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredSalesGroupSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onMouseDown={() => handleSelectSalesGroupSuggestion(suggestion)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
            {/* 納品ID */}
            <div>
              <label htmlFor="delivery_id" className="block text-gray-700 text-sm font-bold mb-2">納品ID</label>
              <input
                type="text"
                id="delivery_id"
                name="delivery_id"
                value={searchParams.delivery_id}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>
            {/* 納品税区分 */}
            <div>
              <label htmlFor="delivery_tax" className="block text-gray-700 text-sm font-bold mb-2">納品税区分</label>
              <input
                type="number"
                id="delivery_tax"
                name="delivery_tax"
                value={searchParams.delivery_tax}
                onChange={handleSearchChange}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
            </div>
            {/* 納品備考 */}
            <div className="relative">
              <label htmlFor="delivery_note" className="block text-gray-700 text-sm font-bold mb-2">納品備考</label>
              <input
                type="text"
                id="delivery_note"
                name="delivery_note"
                value={searchParams.delivery_note}
                onChange={handleSearchChange}
                onFocus={() => setShowDeliveryNoteSuggestions(true)}
                onBlur={() => setTimeout(() => setShowDeliveryNoteSuggestions(false), 100)}
                className="shadow appearance-none border rounded w-full py-1 px-2 text-gray-700 leading-tight focus:outline-none focus:shadow-outline text-sm"
              />
              {showDeliveryNoteSuggestions && filteredDeliveryNoteSuggestions.length > 0 && (
                <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                  {filteredDeliveryNoteSuggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      onMouseDown={() => handleSelectDeliveryNoteSuggestion(suggestion)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100 text-sm"
                    >
                      {suggestion}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
          <div className="flex justify-center mt-6">
            <button
              type="submit"
              className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            >
              検索
            </button>
          </div>
        </form>

        {/* 一括納品書発行ボタン */}
        <div className="mb-4">
          <button
            onClick={handleBulkIssueDelivery}
            className="bg-green-500 hover:bg-green-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
            disabled={selectedDeliveries.length === 0}
          >
            一括納品書発行 ({selectedDeliveries.length})
          </button>
        </div>

        {/* 納品リスト */}
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600">
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">
                  <input
                    type="checkbox"
                    onChange={handleSelectAllChange}
                    checked={selectedDeliveries.length === deliveries.length && deliveries.length > 0}
                  />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品書番号</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品日</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">請求書番号</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">請求日</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">取引先名</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品品番</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品先名</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">合計金額</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品数量</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品単価</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">売上グループ</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">注文番号</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品書ステータス</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">請求書ステータス</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品ID</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap">納品税区分</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">編集</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">削除</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.delivery_id} className="even:bg-gray-100">
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectedDeliveries.includes(delivery.delivery_id)}
                      onChange={() => handleCheckboxChange(delivery.delivery_id)}
                    />
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
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">
                    {delivery.isEditing ? (
                      <input
                        type="text"
                        value={delivery.customer_name}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'customer_name')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.customer_name
                    )}
                  </td>
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
                    {/* Total amount is calculated, not directly editable */}
                    {delivery.total_amount.toFixed(2)}
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
                        type="text"
                        value={delivery.delivery_id}
                        onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_id')}
                        className="w-full p-1 border rounded"
                      />
                    ) : (
                      delivery.delivery_id
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
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
