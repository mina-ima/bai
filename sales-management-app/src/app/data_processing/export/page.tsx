'use client';

import { useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import Link from 'next/link';

export default function ExportPage() {
  const [selectedDataType, setSelectedDataType] = useState<string | null>(null);

  const handleExport = async () => {
    if (!selectedDataType) {
      alert('エクスポートするデータタイプを選択してください。');
      return;
    }

    try {
      const response = await fetch(`/api/export?type=${selectedDataType}`);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${selectedDataType}.csv`; // Dynamic filename
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
      alert('CSVエクスポートが完了しました。');
    } catch (error) {
      console.error('CSVエクスポート中にエラーが発生しました:', error);
      alert('CSVエクスポート中にエラーが発生しました。');
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">CSVエクスポート</h1>
        <div className="bg-green-600 p-6 rounded-md shadow-lg mb-8">
          <h2 className="text-2xl font-bold text-white mb-4">エクスポートするデータを選択</h2>
          <div className="space-y-3 mb-6">
            <label className="flex items-center text-white text-lg">
              <input
                type="radio"
                name="dataType"
                value="company_info"
                checked={selectedDataType === 'company_info'}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="form-radio h-5 w-5 text-green-600"
              />
              <span className="ml-3">会社情報</span>
            </label>
            <label className="flex items-center text-white text-lg">
              <input
                type="radio"
                name="dataType"
                value="customer_list"
                checked={selectedDataType === 'customer_list'}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="form-radio h-5 w-5 text-green-600"
              />
              <span className="ml-3">取引先リスト</span>
            </label>
            <label className="flex items-center text-white text-lg">
              <input
                type="radio"
                name="dataType"
                value="product_list"
                checked={selectedDataType === 'product_list'}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="form-radio h-5 w-5 text-green-600"
              />
              <span className="ml-3">商品リスト</span>
            </label>
            <label className="flex items-center text-white text-lg">
              <input
                type="radio"
                name="dataType"
                value="user_list"
                checked={selectedDataType === 'user_list'}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="form-radio h-5 w-5 text-green-600"
              />
              <span className="ml-3">ユーザーリスト</span>
            </label>
            <label className="flex items-center text-white text-lg">
              <input
                type="radio"
                name="dataType"
                value="delivery_list"
                checked={selectedDataType === 'delivery_list'}
                onChange={(e) => setSelectedDataType(e.target.value)}
                className="form-radio h-5 w-5 text-green-600"
              />
              <span className="ml-3">納品リスト</span>
            </label>
          </div>
          <button
            onClick={handleExport}
            className="w-full py-3 px-6 bg-white text-green-600 font-bold rounded-md text-xl hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2"
          >
            選択したデータをエクスポート
          </button>
        </div>
        <div className="text-center">
          <Link href="/data_processing" className="text-blue-500 hover:underline">
            データ処理メニューに戻る
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
