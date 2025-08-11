'use client';

import { useState, useEffect, useMemo, useRef, FC } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { Customer } from '@/types/customer';
import { Delivery } from '@/types/delivery';

// Type definitions
interface EditableDelivery extends Delivery {
  isEditing?: boolean;
  isCheckedForIssue?: boolean;
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

const initialFilters = {
  delivery_id: '',
  product_name: '',
  quantity_start: '',
  quantity_end: '',
  unit_price_start: '',
  unit_price_end: '',
  delivery_unit: '',
  delivery_note: '',
  delivery_tax_start: '',
  delivery_tax_end: '',
  delivery_orderId: '',
  delivery_salesGroup: '',
  customer_name: '',
  delivery_number: '',
  delivery_invoiceNumber: '',
  delivery_status: '',
  delivery_invoiceStatus: '',
  delivery_date_start: '',
  delivery_date_end: '',
  delivery_invoiceDate_start: '',
  delivery_invoiceDate_end: '',
  total_amount_start: '',
  total_amount_end: '',
  delivery_shippingName: '',
  delivery_shippingPostalcode: '',
  delivery_shippingAddress: '',
  delivery_shippingPhone: '',
};

// Standalone Incremental Search Component
const IncrementalSearchInput: FC<{
  name: keyof typeof initialFilters;
  label: string;
  value: string;
  suggestions: string[];
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSuggestionSelect: (name: keyof typeof initialFilters, value: string) => void;
}> = ({ name, label, value, suggestions, onChange, onSuggestionSelect }) => {
  const [isVisible, setIsVisible] = useState(false);

  const filteredSuggestions = useMemo(() =>
    value ? suggestions.filter(s => s.toLowerCase().includes(value.toLowerCase())) : [],
  [value, suggestions]);

  return (
    <div className="relative">
      <label className="block text-gray-700 text-sm font-bold mb-2">{label}</label>
      <input
        type="text"
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setIsVisible(true)}
        onBlur={() => setTimeout(() => setIsVisible(false), 150)}
        className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700"
        autoComplete="off"
      />
      {isVisible && filteredSuggestions.length > 0 && (
        <ul className="absolute z-20 w-full bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto mt-1">
          {filteredSuggestions.map(suggestion => (
            <li
              key={suggestion}
              onMouseDown={() => onSuggestionSelect(name, suggestion)}
              className="px-3 py-2 cursor-pointer hover:bg-gray-100"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default function DeliverySearchPage() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [deliveries, setDeliveries] = useState<EditableDelivery[]>([]);
  const [originalDeliveries, setOriginalDeliveries] = useState<EditableDelivery[]>([]);
  const [loadingDeliveries, setLoadingDeliveries] = useState(true);
  const [errorDeliveries, setErrorDeliveries] = useState<string | null>(null);
  const [sortConfig, setSortConfig] = useState<{ key: keyof Delivery | null; direction: 'ascending' | 'descending' | null }>({ key: null, direction: null });
  const [columnFilters, setColumnFilters] = useState<Record<keyof Delivery, string>>({} as Record<keyof Delivery, string>);
  const [companyInfo, setCompanyInfo] = useState<CompanyInfo | null>(null);
  
  const [mainSearchFilters, setMainSearchFilters] = useState(initialFilters);
  const [activeSearchFilters, setActiveSearchFilters] = useState(initialFilters);
  const selectAllCheckboxRef = useRef<HTMLInputElement>(null);

  // Data Fetching
  useEffect(() => {
    const fetchDeliveries = async () => {
      try {
        setLoadingDeliveries(true);
        const deliveriesRes = await fetch('/api/delivery');
        const deliveriesData: Delivery[] = await deliveriesRes.json();
        const editableDeliveries = deliveriesData.map(d => ({ ...d, isEditing: false, isCheckedForIssue: false }));
        setDeliveries(editableDeliveries);
        setOriginalDeliveries(editableDeliveries);
      } catch (error: any) {
        console.error("Failed to fetch deliveries:", error);
        setErrorDeliveries(error.message);
      } finally {
        setLoadingDeliveries(false);
      }
    };

    const fetchInitialData = async () => {
      try {
        const [customersRes, companyInfoRes] = await Promise.all([
          fetch('/api/customers'),
          fetch('/data/company_info.json'),
        ]);
        setCustomers(await customersRes.json());
        setCompanyInfo(await companyInfoRes.json());
      } catch (error: any) {
        console.error("Failed to fetch initial data:", error);
        setErrorDeliveries(error.message);
      }
    };
    fetchInitialData();
    fetchDeliveries();
  }, []);

  // Handlers
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>, deliveryId: string, field: keyof Delivery) => {
    const { value } = e.target;
    setDeliveries(prev => prev.map(d => {
      if (d.delivery_id === deliveryId) {
        const updated = { ...d, [field]: ['quantity', 'unit_price', 'delivery_tax'].includes(field) ? parseFloat(value) : value };
        updated.total_amount = updated.quantity * updated.unit_price;
        return updated;
      }
      return d;
    }));
  };

  const handleDeleteDelivery = async (id: string) => {
    if (confirm(`納品ID: ${id} を削除しますか？`)) {
      try {
        const response = await fetch(`/api/delivery?delivery_id=${id}`, { method: 'DELETE' });
        if (response.ok) {
          alert('納品データが削除されました。');
          setDeliveries(prev => prev.filter(d => d.delivery_id !== id));
        } else {
          alert('納品データの削除に失敗しました。');
        }
      } catch (error) {
        console.error('Error deleting delivery:', error);
        alert('納品データの削除中にエラーが発生しました。');
      }
    }
  };

  const handleEdit = (deliveryId: string) => setDeliveries(prev => prev.map(d => (d.delivery_id === deliveryId ? { ...d, isEditing: true } : d)));
  const handleCancel = (deliveryId: string) => setDeliveries(prev => prev.map(d => d.delivery_id === deliveryId ? { ...originalDeliveries.find(od => od.delivery_id === deliveryId)!, isEditing: false } : d));
  const handleCheckboxChange = (deliveryId: string, checked: boolean) => setDeliveries(prev => prev.map(d => (d.delivery_id === deliveryId ? { ...d, isCheckedForIssue: checked } : d)));
  const handleSort = (key: keyof Delivery) => setSortConfig(prev => ({ key, direction: prev.key === key && prev.direction === 'ascending' ? 'descending' : 'ascending' }));
  const handleColumnFilterChange = (key: keyof Delivery, value: string) => setColumnFilters(prev => ({ ...prev, [key]: value }));
  const handleMainSearchChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setMainSearchFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleSuggestionSelect = (name: keyof typeof initialFilters, value: string) => {
    setMainSearchFilters(prev => ({ ...prev, [name]: value }));
  };
  const handleSearch = () => setActiveSearchFilters(mainSearchFilters);
  const handleClear = () => {
    setMainSearchFilters(initialFilters);
    setActiveSearchFilters(initialFilters);
  };

  // Suggestions Logic
  const getSuggestionsFor = (field: keyof Delivery) => useMemo(() => 
    [...new Set(deliveries.map(d => d[field]).filter(Boolean) as string[])].sort((a, b) => a.localeCompare(b)),
  [deliveries]);

  const suggestions = {
    customer_name: getSuggestionsFor('customer_name'),
    product_name: getSuggestionsFor('product_name'),
    delivery_orderId: getSuggestionsFor('delivery_orderId'),
    delivery_salesGroup: getSuggestionsFor('delivery_salesGroup'),
    delivery_shippingPhone: getSuggestionsFor('delivery_shippingPhone'),
    delivery_shippingPostalcode: getSuggestionsFor('delivery_shippingPostalcode'),
    delivery_shippingAddress: getSuggestionsFor('delivery_shippingAddress'),
    delivery_note: getSuggestionsFor('delivery_note'),
  };

  // Filtering and Sorting Logic
  const filteredAndSortedDeliveries = useMemo(() => {
    return [...deliveries]
      .filter(delivery => {
        const checkString = (value: string | null | undefined, filter: string) => !filter || (value || '').toLowerCase().includes(filter.toLowerCase());
        const checkStatus = (value: string, filter: string) => !filter || value === filter;
        const checkRange = (value: number, start: string, end: string) => (!start || value >= parseFloat(start)) && (!end || value <= parseFloat(end));
        const checkDateRange = (value: string, start: string, end: string) => {
            if (!start && !end) return true;
            if (!value) return false;
            const itemDate = new Date(value);
            if (start && itemDate < new Date(start)) return false;
            if (end && itemDate > new Date(end)) return false;
            return true;
        };

        return (
          checkString(delivery.delivery_id, activeSearchFilters.delivery_id) &&
          checkString(delivery.product_name, activeSearchFilters.product_name) &&
          checkRange(delivery.quantity, activeSearchFilters.quantity_start, activeSearchFilters.quantity_end) &&
          checkRange(delivery.unit_price, activeSearchFilters.unit_price_start, activeSearchFilters.unit_price_end) &&
          checkString(delivery.delivery_unit, activeSearchFilters.delivery_unit) &&
          checkString(delivery.delivery_note, activeSearchFilters.delivery_note) &&
          checkRange(delivery.delivery_tax, activeSearchFilters.delivery_tax_start, activeSearchFilters.delivery_tax_end) &&
          checkString(delivery.delivery_orderId, activeSearchFilters.delivery_orderId) &&
          checkString(delivery.delivery_salesGroup, activeSearchFilters.delivery_salesGroup) &&
          checkString(delivery.customer_name, activeSearchFilters.customer_name) &&
          checkString(delivery.delivery_number, activeSearchFilters.delivery_number) &&
          checkString(delivery.delivery_invoiceNumber, activeSearchFilters.delivery_invoiceNumber) &&
          checkStatus(delivery.delivery_status, activeSearchFilters.delivery_status) &&
          checkStatus(delivery.delivery_invoiceStatus, activeSearchFilters.delivery_invoiceStatus) &&
          checkDateRange(delivery.delivery_date, activeSearchFilters.delivery_date_start, activeSearchFilters.delivery_date_end) &&
          checkDateRange(delivery.delivery_invoiceDate, activeSearchFilters.delivery_invoiceDate_start, activeSearchFilters.delivery_invoiceDate_end) &&
          checkRange(delivery.total_amount, activeSearchFilters.total_amount_start, activeSearchFilters.total_amount_end) &&
          checkString(delivery.delivery_shippingName, activeSearchFilters.delivery_shippingName) &&
          checkString(delivery.delivery_shippingPostalcode, activeSearchFilters.delivery_shippingPostalcode) &&
          checkString(delivery.delivery_shippingAddress, activeSearchFilters.delivery_shippingAddress) &&
          checkString(delivery.delivery_shippingPhone, activeSearchFilters.delivery_shippingPhone) &&
          Object.keys(columnFilters).every(key => {
            const filterValue = columnFilters[key as keyof Delivery];
            return !filterValue || String(delivery[key as keyof Delivery] ?? '').toLowerCase().includes(filterValue.toLowerCase());
          })
        );
      })
      .sort((a, b) => {
        if (!sortConfig.key) return 0;
        const aValue = a[sortConfig.key];
        const bValue = b[sortConfig.key];
        if (aValue == null || bValue == null) return 0;
        const direction = sortConfig.direction === 'ascending' ? 1 : -1;
        if (typeof aValue === 'string' && typeof bValue === 'string') return aValue.localeCompare(bValue) * direction;
        if (typeof aValue === 'number' && typeof bValue === 'number') return (aValue - bValue) * direction;
        return String(aValue).localeCompare(String(bValue)) * direction;
      });
  }, [deliveries, activeSearchFilters, columnFilters, sortConfig]);

  // Select All Logic
  const handleSelectAll = (checked: boolean) => {
    const visibleIds = new Set(filteredAndSortedDeliveries.map(d => d.delivery_id));
    setDeliveries(prev => 
      prev.map(d => visibleIds.has(d.delivery_id) ? { ...d, isCheckedForIssue: checked } : d)
    );
  };

  const { allSelected, someSelected } = useMemo(() => {
    const visibleDeliveries = filteredAndSortedDeliveries;
    if (visibleDeliveries.length === 0) return { allSelected: false, someSelected: false };
    const selectedCount = visibleDeliveries.filter(d => d.isCheckedForIssue).length;
    return {
      allSelected: selectedCount === visibleDeliveries.length,
      someSelected: selectedCount > 0 && selectedCount < visibleDeliveries.length,
    };
  }, [filteredAndSortedDeliveries]);

  useEffect(() => {
    if (selectAllCheckboxRef.current) {
      selectAllCheckboxRef.current.indeterminate = someSelected;
    }
  }, [someSelected]);

  if (loadingDeliveries) return <p>納品データを読み込み中...</p>;
  if (errorDeliveries) return <p>エラー: {errorDeliveries}</p>;

  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">納品検索</h1>
        
        <div className="bg-white shadow-md rounded-lg p-8 mb-8">
          <h2 className="text-xl font-bold mb-4">検索条件</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <IncrementalSearchInput name="customer_name" label="取引先名" value={mainSearchFilters.customer_name} suggestions={suggestions.customer_name} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
            <IncrementalSearchInput name="product_name" label="納品品番" value={mainSearchFilters.product_name} suggestions={suggestions.product_name} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
            <IncrementalSearchInput name="delivery_orderId" label="注文番号" value={mainSearchFilters.delivery_orderId} suggestions={suggestions.delivery_orderId} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
            <IncrementalSearchInput name="delivery_salesGroup" label="売上グループ" value={mainSearchFilters.delivery_salesGroup} suggestions={suggestions.delivery_salesGroup} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品日</label>
              <div className="flex items-center space-x-2">
                <input type="date" name="delivery_date_start" value={mainSearchFilters.delivery_date_start} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                <span>〜</span>
                <input type="date" name="delivery_date_end" value={mainSearchFilters.delivery_date_end} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品書番号</label>
              <input type="text" name="delivery_number" value={mainSearchFilters.delivery_number} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品書ステータス</label>
              <select name="delivery_status" value={mainSearchFilters.delivery_status} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value="">すべて</option><option value="未">未</option><option value="済">済</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品先名</label>
              <input type="text" name="delivery_shippingName" value={mainSearchFilters.delivery_shippingName} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">請求日</label>
              <div className="flex items-center space-x-2">
                <input type="date" name="delivery_invoiceDate_start" value={mainSearchFilters.delivery_invoiceDate_start} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                <span>〜</span>
                <input type="date" name="delivery_invoiceDate_end" value={mainSearchFilters.delivery_invoiceDate_end} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">請求書番号</label>
              <input type="text" name="delivery_invoiceNumber" value={mainSearchFilters.delivery_invoiceNumber} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">請求書ステータス</label>
              <select name="delivery_invoiceStatus" value={mainSearchFilters.delivery_invoiceStatus} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700">
                <option value="">すべて</option><option value="未">未</option><option value="済">済</option>
              </select>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品税区分</label>
              <div className="flex items-center space-x-2">
                <input type="number" name="delivery_tax_start" value={mainSearchFilters.delivery_tax_start} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                <span>〜</span>
                <input type="number" name="delivery_tax_end" value={mainSearchFilters.delivery_tax_end} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品数量</label>
              <div className="flex items-center space-x-2">
                <input type="number" name="quantity_start" value={mainSearchFilters.quantity_start} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                <span>〜</span>
                <input type="number" name="quantity_end" value={mainSearchFilters.quantity_end} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品単価</label>
              <div className="flex items-center space-x-2">
                <input type="number" name="unit_price_start" value={mainSearchFilters.unit_price_start} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                <span>〜</span>
                <input type="number" name="unit_price_end" value={mainSearchFilters.unit_price_end} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">合計金額</label>
              <div className="flex items-center space-x-2">
                <input type="number" name="total_amount_start" value={mainSearchFilters.total_amount_start} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
                <span>〜</span>
                <input type="number" name="total_amount_end" value={mainSearchFilters.total_amount_end} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品単位</label>
              <input type="text" name="delivery_unit" value={mainSearchFilters.delivery_unit} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            <IncrementalSearchInput name="delivery_shippingPhone" label="納品先電話" value={mainSearchFilters.delivery_shippingPhone} suggestions={suggestions.delivery_shippingPhone} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
            <IncrementalSearchInput name="delivery_shippingPostalcode" label="納品先〒" value={mainSearchFilters.delivery_shippingPostalcode} suggestions={suggestions.delivery_shippingPostalcode} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
            <IncrementalSearchInput name="delivery_shippingAddress" label="納品先住所" value={mainSearchFilters.delivery_shippingAddress} suggestions={suggestions.delivery_shippingAddress} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
            <div>
              <label className="block text-gray-700 text-sm font-bold mb-2">納品ID</label>
              <input type="text" name="delivery_id" value={mainSearchFilters.delivery_id} onChange={handleMainSearchChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700" />
            </div>
            <IncrementalSearchInput name="delivery_note" label="納品備考" value={mainSearchFilters.delivery_note} suggestions={suggestions.delivery_note} onChange={handleMainSearchChange} onSuggestionSelect={handleSuggestionSelect} />
          </div>
          <div className="flex justify-end mt-6 space-x-4">
            <button type="button" onClick={handleClear} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">クリア</button>
            <button type="button" onClick={handleSearch} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">絞り込み・検索</button>
          </div>
        </div>

        <h2 className="text-size-30 font-bold text-center mt-8 mb-4">納品リスト</h2>
        <div className="flex justify-start mb-4">
          <button onClick={() => handleIssue(false)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline mr-2">個別納品書発行</button>
          <button onClick={() => handleIssue(true)} className="bg-purple-500 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline">一括納品書発行</button>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-blue-600">
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">
                  <input type="checkbox" ref={selectAllCheckboxRef} checked={allSelected} onChange={() => handleSelectAll(!allSelected)} className="form-checkbox h-4 w-4 text-blue-600" />
                </th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_id')}>納品ID {sortConfig.key === 'delivery_id' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_id || ''} onChange={(e) => handleColumnFilterChange('delivery_id', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('product_name')}>納品品番 {sortConfig.key === 'product_name' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.product_name || ''} onChange={(e) => handleColumnFilterChange('product_name', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('quantity')}>納品数量 {sortConfig.key === 'quantity' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="number" placeholder="Filter" value={columnFilters.quantity || ''} onChange={(e) => handleColumnFilterChange('quantity', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('unit_price')}>納品単価 {sortConfig.key === 'unit_price' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="number" placeholder="Filter" value={columnFilters.unit_price || ''} onChange={(e) => handleColumnFilterChange('unit_price', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('total_amount')}>合計金額 {sortConfig.key === 'total_amount' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="number" placeholder="Filter" value={columnFilters.total_amount || ''} onChange={(e) => handleColumnFilterChange('total_amount', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_unit')}>納品単位 {sortConfig.key === 'delivery_unit' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_unit || ''} onChange={(e) => handleColumnFilterChange('delivery_unit', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_note')}>納品備考 {sortConfig.key === 'delivery_note' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_note || ''} onChange={(e) => handleColumnFilterChange('delivery_note', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_tax')}>納品税区分 {sortConfig.key === 'delivery_tax' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="number" placeholder="Filter" value={columnFilters.delivery_tax || ''} onChange={(e) => handleColumnFilterChange('delivery_tax', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_orderId')}>注文番号 {sortConfig.key === 'delivery_orderId' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_orderId || ''} onChange={(e) => handleColumnFilterChange('delivery_orderId', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_salesGroup')}>売上グループ {sortConfig.key === 'delivery_salesGroup' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_salesGroup || ''} onChange={(e) => handleColumnFilterChange('delivery_salesGroup', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('customer_name')}>取引先名 {sortConfig.key === 'customer_name' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.customer_name || ''} onChange={(e) => handleColumnFilterChange('customer_name', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingName')}>納品先名 {sortConfig.key === 'delivery_shippingName' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_shippingName || ''} onChange={(e) => handleColumnFilterChange('delivery_shippingName', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingPostalcode')}>納品先〒 {sortConfig.key === 'delivery_shippingPostalcode' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_shippingPostalcode || ''} onChange={(e) => handleColumnFilterChange('delivery_shippingPostalcode', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingAddress')}>納品先住所 {sortConfig.key === 'delivery_shippingAddress' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_shippingAddress || ''} onChange={(e) => handleColumnFilterChange('delivery_shippingAddress', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_shippingPhone')}>納品先電話 {sortConfig.key === 'delivery_shippingPhone' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_shippingPhone || ''} onChange={(e) => handleColumnFilterChange('delivery_shippingPhone', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_number')}>納品書番号 {sortConfig.key === 'delivery_number' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_number || ''} onChange={(e) => handleColumnFilterChange('delivery_number', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_invoiceNumber')}>請求書番号 {sortConfig.key === 'delivery_invoiceNumber' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_invoiceNumber || ''} onChange={(e) => handleColumnFilterChange('delivery_invoiceNumber', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_status')}>納品書ステータス {sortConfig.key === 'delivery_status' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_status || ''} onChange={(e) => handleColumnFilterChange('delivery_status', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_invoiceStatus')}>請求書ステータス {sortConfig.key === 'delivery_invoiceStatus' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="text" placeholder="Filter" value={columnFilters.delivery_invoiceStatus || ''} onChange={(e) => handleColumnFilterChange('delivery_invoiceStatus', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_date')}>納品日 {sortConfig.key === 'delivery_date' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="date" placeholder="Filter" value={columnFilters.delivery_date || ''} onChange={(e) => handleColumnFilterChange('delivery_date', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-left border border-gray-300 whitespace-nowrap cursor-pointer" onClick={() => handleSort('delivery_invoiceDate')}>請求日 {sortConfig.key === 'delivery_invoiceDate' ? (sortConfig.direction === 'ascending' ? '⬆️' : '⬇️') : ''}<br /><input type="date" placeholder="Filter" value={columnFilters.delivery_invoiceDate || ''} onChange={(e) => handleColumnFilterChange('delivery_invoiceDate', e.target.value)} className="mt-1 p-1 w-full text-gray-800 rounded text-xs" onClick={(e) => e.stopPropagation()} /></th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">編集</th>
                <th className="py-2 px-4 text-white font-bold text-sm text-center border border-gray-300 whitespace-nowrap">削除</th>
              </tr>
            </thead>
            <tbody>
              {filteredAndSortedDeliveries.map((delivery) => (
                <tr key={delivery.delivery_id} className="even:bg-gray-100">
                  <td className="py-2 px-4 text-center border border-gray-300 text-base"><input type="checkbox" checked={delivery.isCheckedForIssue || false} onChange={(e) => handleCheckboxChange(delivery.delivery_id, e.target.checked)} className="form-checkbox h-4 w-4 text-blue-600" disabled={delivery.isEditing} /></td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_id} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_id')} className="w-full p-1 border rounded" /> : delivery.delivery_id}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.product_name} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'product_name')} className="w-full p-1 border rounded" /> : delivery.product_name}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="number" value={delivery.quantity} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'quantity')} className="w-full p-1 border rounded" /> : delivery.quantity}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="number" value={delivery.unit_price} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'unit_price')} className="w-full p-1 border rounded" /> : delivery.unit_price}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{(delivery.quantity * delivery.unit_price).toFixed(2)}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_unit} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_unit')} className="w-full p-1 border rounded" /> : delivery.delivery_unit}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <textarea value={delivery.delivery_note} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_note')} className="w-full p-1 border rounded" rows={2} /> : delivery.delivery_note}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="number" value={delivery.delivery_tax} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_tax')} className="w-full p-1 border rounded" /> : delivery.delivery_tax}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_orderId} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_orderId')} className="w-full p-1 border rounded" /> : delivery.delivery_orderId}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_salesGroup} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_salesGroup')} className="w-full p-1 border rounded" /> : delivery.delivery_salesGroup}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.customer_name} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'customer_name')} className="w-full p-1 border rounded" /> : delivery.customer_name}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_shippingName} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingName')} className="w-full p-1 border rounded" /> : delivery.delivery_shippingName}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_shippingPostalcode} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingPostalcode')} className="w-full p-1 border rounded" /> : delivery.delivery_shippingPostalcode}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_shippingAddress} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingAddress')} className="w-full p-1 border rounded" /> : delivery.delivery_shippingAddress}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_shippingPhone} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_shippingPhone')} className="w-full p-1 border rounded" /> : delivery.delivery_shippingPhone}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_number} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_number')} className="w-full p-1 border rounded" /> : delivery.delivery_number}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="text" value={delivery.delivery_invoiceNumber} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_invoiceNumber')} className="w-full p-1 border rounded" /> : delivery.delivery_invoiceNumber}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <select value={delivery.delivery_status} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_status')} className="w-full p-1 border rounded"><option value="未">未</option><option value="済">済</option></select> : delivery.delivery_status}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <select value={delivery.delivery_invoiceStatus} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_invoiceStatus')} className="w-full p-1 border rounded"><option value="未">未</option><option value="済">済</option></select> : delivery.delivery_invoiceStatus}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="date" value={delivery.delivery_date} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_date')} className="w-full p-1 border rounded" /> : delivery.delivery_date}</td>
                  <td className="py-2 px-4 text-left border border-gray-300 text-base whitespace-nowrap">{delivery.isEditing ? <input type="date" value={delivery.delivery_invoiceDate} onChange={(e) => handleEditChange(e, delivery.delivery_id, 'delivery_invoiceDate')} className="w-full p-1 border rounded" /> : delivery.delivery_invoiceDate}</td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">{delivery.isEditing ? (<><button onClick={() => handleSave(delivery)} className="bg-green-500 hover:bg-green-700 text-white font-bold py-1 px-2 rounded text-xs mr-1">保存</button><button onClick={() => handleCancel(delivery.delivery_id)} className="bg-gray-500 hover:bg-gray-700 text-white font-bold py-1 px-2 rounded text-xs">キャンセル</button></>) : (<button onClick={() => handleEdit(delivery.delivery_id)} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-1 px-2 rounded text-xs">編集</button>)}</td>
                  <td className="py-2 px-4 text-center border border-gray-300 text-base">{!delivery.isEditing && (<button onClick={() => handleDeleteDelivery(delivery.delivery_id)} className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs">削除</button>)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
