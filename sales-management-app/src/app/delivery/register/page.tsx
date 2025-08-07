'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';
import { Product } from '@/types/product';
import { Delivery } from '@/types/delivery';
import { DeliveryNotePdfProps } from '@/components/DeliveryNotePdf'; // PDF Propsをインポート

interface EditableDelivery extends Delivery {
  isEditing?: boolean;
}

// 会社情報の型定義 (company_info.json に合わせる)
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

export default function DeliveryRegisterPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [deliveries, setDeliveries] = useState<EditableDelivery[]>([]);
  const [originalDeliveries, setOriginalDeliveries] = useState<EditableDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [errorDeliveries, setErrorDeliveries] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Delivery | null; direction: 'ascending' | 'descending' | null }>({ key: null, direction: null });
  const [filters, setFilters] = useState<Record<keyof Delivery, string>>({} as Record<keyof Delivery, string>);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null); // 会社情報を追加
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

  // 取引先名インクリメンタルサーチ用の新しいステート
  const [customerSearchTerm, setCustomerSearchTerm] = useState<string>('');
  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState<boolean>(false);


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
      const editableDeliveries = deliveriesData.map(d => ({ ...d, isEditing: false }));
      setDeliveries(editableDeliveries);
      setOriginalDeliveries(editableDeliveries);
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
        const [customersRes, productsRes, companyInfoRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/api/products'),
          fetch('/data/company_info.json'),
        ]);
        const customersData = await customersRes.json();
        const productsData = await productsRes.json();
        const companyData = await companyInfoRes.json();

        setCustomers(customersData);
        setProducts(productsData);
        setCompanyInfo(companyData);
        console.log("Fetched Products:", productsData);
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        setErrorDeliveries(error.message);
      }
    };
    fetchInitialData();
    fetchDeliveries();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setDeliveryData(prevData => ({
      ...prevData,
      [name]: name === 'quantity' || name === 'unit_price' || name === 'delivery_tax' ? parseFloat(value) : value,
    }));
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
    deliveryId: string,
    field: keyof Delivery
  ) => {
    const { value } = e.target;
    console.log(`handleEditChange: deliveryId=${deliveryId}, field=${String(field)}, value=${value}`);
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery => {
        if (delivery.delivery_id === deliveryId) {
          const updatedDelivery = {
            ...delivery,
            [field]:
              field === 'quantity' || field === 'unit_price' || field === 'delivery_tax'
                ? parseFloat(value)
                : value,
          };
          // total_amount の計算を更新された値に基づいて行う
          updatedDelivery.total_amount = updatedDelivery.quantity * updatedDelivery.unit_price;
          console.log(`handleEditChange: Updated delivery for ${deliveryId}:`, updatedDelivery);
          return updatedDelivery;
        }
        return delivery;
      })
    );
  };

  // 取引先名インクリメンタルサーチの入力変更ハンドラ
  const handleCustomerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setCustomerSearchTerm(value);
    setShowCustomerSuggestions(true); // 入力時に候補を表示
    setDeliveryData(prevData => ({
      ...prevData,
      customer_name: value, // 入力中の値をdeliveryDataにも反映
    }));
  };

  // 取引先名候補選択ハンドラ
  const handleCustomerSelect = (customer: Customer) => {
    setDeliveryData(prevData => ({
      ...prevData,
      customer_name: customer.customer_name, // 選択された顧客名をセット
    }));
    setCustomerSearchTerm(customer.customer_name); // 検索ボックスの値を更新
    setShowCustomerSuggestions(false); // 候補を非表示
    setProductSearchTerm(''); // 取引先が変更されたら商品検索語をリセット
    setShowProductSuggestions(false); // 商品候補も非表示にする
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
      delivery_shippingName: product.product_shippingName,
      delivery_shippingPostalcode: product.product_shippingPostalcode,
      delivery_shippingAddress: product.product_shippingAddress,
      delivery_shippingPhone: product.product_shippingPhone,
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
          delivery_shippingName: '',
          delivery_shippingPostalcode: '',
          delivery_shippingAddress: '',
          delivery_shippingPhone: '',
        });
        setProductSearchTerm('');
        setShowProductSuggestions(false);
        fetchDeliveries();
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
          const updatedDeliveries = deliveries.filter(delivery => delivery.delivery_id !== id);
          setDeliveries(updatedDeliveries);
          setOriginalDeliveries(updatedDeliveries);
        } else {
          alert('納品データの削除に失敗しました。');
        }
      } catch (error) {
        console.error('Error deleting delivery:', error);
        alert('納品データの削除中にエラーが発生しました。');
      }
    }
  };

  const handleEdit = (deliveryId: string) => {
    setDeliveries(prevDeliveries =>
      prevDeliveries.map(delivery =>
        delivery.delivery_id === deliveryId ? { ...delivery, isEditing: true } : delivery
      )
    );
  };

  const handleSave = async (deliveryToSave: EditableDelivery): Promise<Delivery> => {
    try {
                  // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { isEditing, ...deliveryDataToSend } = deliveryToSave;
      console.log('handleSave: Sending deliveryDataToSend:', deliveryDataToSend);
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
      console.log('handleSave: Received savedDelivery:', savedDelivery);

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
      alert('納品データが更新されました。');
      return savedDelivery;
    } catch (e: any) {
      setErrorDeliveries(e.message);
      alert(`納品データの更新に失敗しました: ${e.message}`);
      throw e;
    }
  };

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
    const customer = customers.find(c => c.customer_name === deliveryToIssue?.customer_name);

    if (!deliveryToIssue || !companyInfo || !customer) {
      alert(`納品書発行に必要な情報が不足しています。
会社情報または顧客情報が読み込まれていない可能性があります。`);
      return;
    }

    try {
      // まず納品ステータスを更新し、サーバーから最新のデータ（納品書番号を含む）を取得
      const updatedDelivery: EditableDelivery = {
        ...deliveryToIssue,
        delivery_status: '済',
        // delivery_invoiceStatus は納品書発行では更新しない
      };
      const savedDelivery = await handleSave(updatedDelivery); // 更新されたデータを取得

      const pdfData: DeliveryNotePdfProps = {
        deliveryNoteNumber: savedDelivery.delivery_number || '未設定', // 更新された納品書番号を使用
        deliveryDate: savedDelivery.delivery_date, // 納品日
        companyInfo: {
          name: companyInfo.company_name,
          postalCode: companyInfo.company_postalCode,
          address: companyInfo.company_address,
          phone: companyInfo.company_phone,
          fax: companyInfo.company_fax,
          bankName: companyInfo.company_bankName,
          branchName: companyInfo.company_bankBranch,
          accountType: companyInfo.company_bankType,
          accountNumber: companyInfo.company_bankNumber,
          personInCharge: companyInfo.company_contactPerson,
        },
        customerInfo: {
          code: customer.customer_id,
          postalCode: customer.customer_postalCode,
          address: customer.customer_address,
          name: customer.customer_formalName || customer.customer_name, // 正式名称があればそれを使用
        },
        deliveryItems: [
          {
            productCode: savedDelivery.product_name,
            quantity: savedDelivery.quantity,
            unit: savedDelivery.delivery_unit,
            unitPrice: savedDelivery.unit_price,
            remarks: savedDelivery.delivery_note,
          },
        ],
      };

      const response = await fetch('/api/delivery/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          deliveries: pdfData.deliveryItems,
          companyInfo: pdfData.companyInfo,
          customers: [pdfData.customerInfo],
          delivery_number: savedDelivery.delivery_number,
          delivery_date: savedDelivery.delivery_date,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `納品書_${savedDelivery.delivery_number || savedDelivery.delivery_id}.pdf`; // 更新された納品書番号を使用
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
        alert('納品書を生成しました。');
      } else {
        console.error('Failed to generate PDF:', response.statusText);
        alert('納品書生成に失敗しました。');
      }
    } catch (error) {
      console.error('Error generating PDF or updating delivery status:', error);
      alert('納品書生成またはデータ更新中にエラーが発生しました。');
    }
  };

  // 取引先名候補のフィルタリングとソート
  const filteredAndSortedCustomers = customers
    .filter(customer => {
      const searchTermLower = customerSearchTerm.toLowerCase();
      return (
        customer.customer_name.toLowerCase().includes(searchTermLower) ||
        (customer.customer_formalName && customer.customer_formalName.toLowerCase().includes(searchTermLower))
      );
    })
    .sort((a, b) => a.customer_name.localeCompare(b.customer_name));


  const filteredAndSortedProducts = products
    .filter(product => {
      const matchesSearchTerm = product.product_name.toLowerCase().includes(productSearchTerm.toLowerCase());
      const selectedCustomerName = deliveryData.customer_name.trim().toLowerCase();
      // product.customer_name が undefined や null の場合を考慮
      const productCustomerName = (product.customer_name || '').trim().toLowerCase(); // 修正箇所

      // 取引先が選択されていない場合は、すべての商品を対象とする
      // 取引先が選択されている場合は、商品の取引先名が選択された取引先名と一致する場合のみ対象とする
      const matchesCustomer = selectedCustomerName === '' || productCustomerName === selectedCustomerName;

      return matchesSearchTerm && matchesCustomer;
    })
    .sort((a, b) => a.product_name.localeCompare(b.product_name));

  const handleSort = (key: keyof Delivery) => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const handleFilterChange = (key: keyof Delivery, value: string) => {
    setFilters(prevFilters => ({
      ...prevFilters,
      [key]: value,
    }));
  };

  const filteredAndSortedDeliveries = [...deliveries]
    .filter(delivery => {
      return Object.keys(filters).every(key => {
        const filterValue = filters[key as keyof Delivery];
        if (!filterValue) return true;
        const deliveryValue = String(delivery[key as keyof Delivery]);
        return deliveryValue.toLowerCase().includes(filterValue.toLowerCase());
      });
    })
    .sort((a, b) => {
      if (sortConfig.key) {
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];

        if (typeof aValue === 'string' && typeof bValue === 'string') {
          return sortConfig.direction === 'ascending'
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        } else if (typeof aValue === 'number' && typeof bValue === 'number') {
          return sortConfig.direction === 'ascending' ? aValue - bValue : bValue - aValue;
        } else if (typeof aValue === 'boolean' && typeof bValue === 'boolean') {
          return sortConfig.direction === 'ascending'
            ? (aValue === bValue ? 0 : aValue ? -1 : 1)
            : (aValue === bValue ? 0 : aValue ? 1 : -1);
        } else {
          // Fallback for mixed types or unsupported types
          const aString = String(aValue);
          const bString = String(bValue);
          return sortConfig.direction === 'ascending'
            ? aString.localeCompare(bString)
            : bString.localeCompare(aString);
        }
      }
      return 0;
    });

  if (loadingDeliveries) return <p>納品データを読み込み中...</p>;
  if (errorDeliveries) return <p>エラー: {errorDeliveries}</p>;

  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">納品登録</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8"
          onKeyDown={(e) => { // onKeyDown イベントハンドラを追加
            if (e.key === 'Enter') {
              e.preventDefault(); // Enterキーでのフォーム送信を防止
            }
          }}
        >

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
                inputMode="numeric" // 追加
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
                inputMode="text" // 追加
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

          {/* 取引先名 - インクリメンタルサーチに変更 */}
          <div className="mb-4 relative">
            <label htmlFor="customer_name" className="block text-gray-700 text-sm font-bold mb-2">取引先名</label>
            <input
              type="text"
              id="customer_name"
              name="customer_name"
              value={customerSearchTerm} // customerSearchTerm にバインド
              onChange={handleCustomerSearchChange} // 新しいハンドラ
              onFocus={() => setShowCustomerSuggestions(true)} // フォーカス時に候補を表示
              onBlur={() => setTimeout(() => setShowCustomerSuggestions(false), 100)} // フォーカスが外れたら少し遅れて非表示
              placeholder="取引先名を検索"
              className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            />
            {showCustomerSuggestions && customerSearchTerm && ( // 入力があり、候補表示が有効な場合のみ表示
              <ul className="absolute z-10 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
                {filteredAndSortedCustomers.length > 0 ? (
                  filteredAndSortedCustomers.map(customer => (
                    <li
                      key={customer.customer_id}
                      onMouseDown={() => handleCustomerSelect(customer)}
                      className="px-3 py-2 cursor-pointer hover:bg-gray-100"
                    >
                      {customer.customer_name} {customer.customer_formalName ? `(${customer.customer_formalName})` : ''}
                    </li>
                  ))
                ) : (
                  <li className="px-3 py-2 text-gray-500">取引先が見つかりません</li>
                )}
              </ul>
            )}
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
                  onChange={handleChange}
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
                inputMode="numeric" // 追加
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
                inputMode="numeric" // 追加
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
                inputMode="numeric" // 追加
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
                inputMode="tel" // 追加
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
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_id')}>
                  納品ID {sortConfig.key === 'delivery_id' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_id || ''} onChange={(e) => handleFilterChange('delivery_id', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_name')}>
                  納品品番 {sortConfig.key === 'product_name' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.product_name || ''} onChange={(e) => handleFilterChange('product_name', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('quantity')}>
                  納品数量 {sortConfig.key === 'quantity' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="number" placeholder="Filter" value={filters.quantity || ''} onChange={(e) => handleFilterChange('quantity', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('unit_price')}>
                  納品単価 {sortConfig.key === 'unit_price' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="number" placeholder="Filter" value={filters.unit_price || ''} onChange={(e) => handleFilterChange('unit_price', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('total_amount')}>
                  合計金額 {sortConfig.key === 'total_amount' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="number" placeholder="Filter" value={filters.total_amount || ''} onChange={(e) => handleFilterChange('total_amount', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_unit')}>
                  納品単位 {sortConfig.key === 'delivery_unit' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_unit || ''} onChange={(e) => handleFilterChange('delivery_unit', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_note')}>
                  納品備考 {sortConfig.key === 'delivery_note' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_note || ''} onChange={(e) => handleFilterChange('delivery_note', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_tax')}>
                  納品税区分 {sortConfig.key === 'delivery_tax' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="number" placeholder="Filter" value={filters.delivery_tax || ''} onChange={(e) => handleFilterChange('delivery_tax', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_orderId')}>
                  注文番号 {sortConfig.key === 'delivery_orderId' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_orderId || ''} onChange={(e) => handleFilterChange('delivery_orderId', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_salesGroup')}>
                  売上グループ {sortConfig.key === 'delivery_salesGroup' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_salesGroup || ''} onChange={(e) => handleFilterChange('delivery_salesGroup', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('customer_name')}>
                  取引先名 {sortConfig.key === 'customer_name' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.customer_name || ''} onChange={(e) => handleFilterChange('customer_name', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingName')}>
                  納品先名 {sortConfig.key === 'delivery_shippingName' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_shippingName || ''} onChange={(e) => handleFilterChange('delivery_shippingName', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingPostalcode')}>
                  納品先〒 {sortConfig.key === 'delivery_shippingPostalcode' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_shippingPostalcode || ''} onChange={(e) => handleFilterChange('delivery_shippingPostalcode', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingAddress')}>
                  納品先住所 {sortConfig.key === 'delivery_shippingAddress' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_shippingAddress || ''} onChange={(e) => handleFilterChange('delivery_shippingAddress', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingPhone')}>
                  納品先電話 {sortConfig.key === 'delivery_shippingPhone' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_shippingPhone || ''} onChange={(e) => handleFilterChange('delivery_shippingPhone', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_number')}>
                  納品書番号 {sortConfig.key === 'delivery_number' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_number || ''} onChange={(e) => handleFilterChange('delivery_number', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_invoiceNumber')}>
                  請求書番号 {sortConfig.key === 'delivery_invoiceNumber' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_invoiceNumber || ''} onChange={(e) => handleFilterChange('delivery_invoiceNumber', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_status')}>
                  納品書ステータス {sortConfig.key === 'delivery_status' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_status || ''} onChange={(e) => handleFilterChange('delivery_status', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_invoiceStatus')}>
                  請求書ステータス {sortConfig.key === 'delivery_invoiceStatus' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="text" placeholder="Filter" value={filters.delivery_invoiceStatus || ''} onChange={(e) => handleFilterChange('delivery_invoiceStatus', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_date')}>
                  納品日 {sortConfig.key === 'delivery_date' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="date" placeholder="Filter" value={filters.delivery_date || ''} onChange={(e) => handleFilterChange('delivery_date', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_invoiceDate')}>
                  請求日 {sortConfig.key === 'delivery_invoiceDate' ? (sortConfig.direction === 'ascending' ? ' ⬆️' : ' ⬇️') : ''}
                  <br /><input type="date" placeholder="Filter" value={filters.delivery_invoiceDate || ''} onChange={(e) => handleFilterChange('delivery_invoiceDate', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">編集</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">削除</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">発行</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDeliveries.map((delivery) => (
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