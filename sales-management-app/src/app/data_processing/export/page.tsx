'use client';

import { useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

// データ構造とラベルの定義
const DATA_STRUCTURES: { [key: string]: { name: string; fields: { id: string; label: string }[] } } = {
  company_info: {
    name: '会社情報',
    fields: [
      { id: 'company_name', label: '自社名' }, { id: 'company_postalCode', label: '自社〒' },
      { id: 'company_address', label: '自社住所' }, { id: 'company_phone', label: '自社電話' },
      { id: 'company_fax', label: '自社FAX' }, { id: 'company_mail', label: '自社Mail' },
      { id: 'company_contactPerson', label: '自社担当者' }, { id: 'company_bankName', label: '自社口座（銀行名）' },
      { id: 'company_bankBranch', label: '自社口座（支店名）' }, { id: 'company_bankType', label: '自社口座（口座種）' },
      { id: 'company_bankNumber', label: '自社口座（口座番号）' }, { id: 'company_bankHolder', label: '自社口座（口座名義）' },
      { id: 'company_invoiceNumber', label: '自社適格請求書番号' },
    ],
  },
  customer_list: {
    name: '取引先リスト',
    fields: [
        { id: 'customer_id', label: '取引先ID' }, { id: 'customer_name', label: '取引先名' },
        { id: 'customer_postalCode', label: '郵便番号' }, { id: 'customer_address', label: '住所' },
        { id: 'customer_phone', label: '電話番号' }, { id: 'customer_fax', label: 'FAX番号' },
        { id: 'customer_email', label: 'メールアドレス' }, { id: 'customer_contactPerson', label: '担当者名' },
    ],
  },
  product_list: {
    name: '商品リスト',
    fields: [
        { id: 'product_id', label: '商品ID' }, { id: 'product_name', label: '商品名' },
        { id: 'product_shippingName', label: '発送先名' }, { id: 'product_shippingPostalcode', label: '発送先〒' },
        { id: 'product_shippingAddress', label: '発送先住所' }, { id: 'product_shippingPhone', label: '発送先電話' },
        { id: 'product_tax', label: '税区分' }, { id: 'product_unit', label: '単位' },
        { id: 'product_unitPrice', label: '単価' }, { id: 'product_note', label: '商品備考' },
        { id: 'customer_name', label: '取引先名' },
    ],
  },
  user_list: {
    name: 'ユーザーリスト',
    fields: [
        { id: 'user_id', label: 'ユーザーID' }, { id: 'user_name', label: 'ユーザー名' }, { id: 'user_authority', label: 'ユーザー権限' },
    ],
  },
};

export default function ExportPage() {
  const [selectedData, setSelectedData] = useState<string>('');
  const [filters, setFilters] = useState<{ [key: string]: string }>({});
  const [results, setResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const handleFilterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const handleSearch = async () => {
    if (!selectedData) return;
    setIsLoading(true);
    setResults([]);
    try {
      const query = new URLSearchParams({ type: selectedData, ...filters });
      const response = await fetch(`/api/data?${query.toString()}`);
      if (!response.ok) throw new Error('データの取得に失敗しました。');
      const data = await response.json();
      setResults(data);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : '不明なエラー');
    } finally {
      setIsLoading(false);
    }
  };

  const handleExport = async () => {
    if (!selectedData) return;
    setIsExporting(true);
    try {
      const query = new URLSearchParams({ type: selectedData, ...filters });
      const response = await fetch(`/api/export?${query.toString()}`);
      if (!response.ok) throw new Error('エクスポートに失敗しました。');
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedData}.csv`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert(error instanceof Error ? error.message : '不明なエラー');
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">CSVエクスポート</h1>
        <div className="bg-white shadow-md rounded-lg p-8">
          {/* Step 1: Select Data */}
          <div className="mb-6">
            <label className="block text-lg font-medium text-gray-700 mb-2">1. データ選択</label>
            <select onChange={e => { setSelectedData(e.target.value); setFilters({}); setResults([]); }} className="w-full p-3 border border-gray-300 rounded-md h-12">
              <option value="">-- 選択してください --</option>
              {Object.entries(DATA_STRUCTURES).map(([key, { name }]) => <option key={key} value={key}>{name}</option>)}
            </select>
          </div>

          {/* Step 2: Filters */}
          {selectedData && selectedData !== 'company_info' && (
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">2. 絞り込み条件（任意）</label>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4 border rounded-md bg-gray-50">
                {DATA_STRUCTURES[selectedData].fields.map(field => (
                  <div key={field.id}>
                    <label htmlFor={field.id} className="block text-sm font-medium text-gray-600">{field.label}</label>
                    <input type="text" id={field.id} name={field.id} value={filters[field.id] || ''} onChange={handleFilterChange} className="w-full p-2 mt-1 border rounded-md" />
                  </div>
                ))}
              </div>
              <button onClick={handleSearch} disabled={isLoading} className="mt-4 w-full py-3 px-6 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 disabled:bg-gray-400">
                {isLoading ? '検索中...' : '絞り込み実行'}
              </button>
            </div>
          )}

          {/* Step 3: Export Button for Company Info */}
          {selectedData === 'company_info' && (
            <div className="mb-6">
              <button onClick={handleExport} disabled={isExporting} className="mt-4 w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                {isExporting ? 'エクスポート中...' : 'CSVでエクスポート'}
              </button>
            </div>
          )}

          {/* Step 3: Results */}
          {results.length > 0 && selectedData !== 'company_info' && (
            <div className="mb-6">
              <label className="block text-lg font-medium text-gray-700 mb-2">3. 実行結果</label>
              <div className="overflow-x-auto">
                <table className="min-w-full bg-white border">
                  <thead>
                    <tr>
                      {selectedData && DATA_STRUCTURES[selectedData].fields.map(f => <th key={f.id} className="py-2 px-4 border-b bg-gray-100">{f.label}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {results.map((row, index) => (
                      <tr key={index}>
                        {selectedData && DATA_STRUCTURES[selectedData].fields.map(f => <td key={f.id} className="py-2 px-4 border-b">{String(row[f.id] ?? '')}</td>)}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <button onClick={handleExport} disabled={isExporting} className="mt-4 w-full py-3 px-6 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 disabled:bg-gray-400">
                {isExporting ? 'エクスポート中...' : 'この結果をCSVでエクスポート'}
              </button>
            </div>
          )}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}