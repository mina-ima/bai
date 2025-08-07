'use client';

import { useState } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

const DATA_TYPES = [
  { id: 'company_info', name: '会社情報' },
  { id: 'customer_list', name: '取引先リスト' },
  { id: 'product_list', name: '商品リスト' },
  { id: 'user_list', name: 'ユーザーリスト' },
  { id: 'delivery_list', name: '納品リスト' },
];

export default function ImportPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedDataType, setSelectedDataType] = useState<string>('');
  const [isImporting, setIsImporting] = useState(false);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    } else {
      setSelectedFile(null);
    }
  };

  const handleDataTypeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setSelectedDataType(event.target.value);
  };

  const handleImport = async () => {
    if (!selectedFile || !selectedDataType) {
      alert('ファイルとデータタイプを選択してください。');
      return;
    }

    setIsImporting(true);
    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('dataType', selectedDataType);

    try {
      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        alert('データのインポートが完了しました。');
        setSelectedFile(null);
        setSelectedDataType('');
      } else {
        const errorData = await response.json();
        alert(`インポートに失敗しました: ${errorData.error || response.statusText}`);
      }
    } catch (error) {
      console.error('インポートエラー:', error);
      alert('不明なエラーが発生しました。');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">CSVインポート</h1>
        <div className="bg-white shadow-md rounded-lg p-8">
          <div className="mb-6">
            <label htmlFor="file-upload" className="block text-lg font-medium text-gray-700 mb-2">
              1. インポートするCSVファイルを選択
            </label>
            <input
              id="file-upload"
              type="file"
              accept=".csv"
              onChange={handleFileChange}
              className="w-full p-3 border border-gray-300 rounded-md"
            />
          </div>

          <div className="mb-6">
            <label htmlFor="data-type-select" className="block text-lg font-medium text-gray-700 mb-2">
              2. インポートするデータの種類を選択
            </label>
            <select
              id="data-type-select"
              value={selectedDataType}
              onChange={handleDataTypeChange}
              className="w-full p-3 border border-gray-300 rounded-md h-12"
            >
              <option value="">-- 選択してください --</option>
              {DATA_TYPES.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center justify-center mt-8">
            <button
              onClick={handleImport}
              disabled={isImporting || !selectedFile || !selectedDataType}
              className="w-full py-4 px-8 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-2xl text-center disabled:bg-gray-400 disabled:cursor-not-allowed"
            >
              {isImporting ? 'インポート中...' : 'インポート実行'}
            </button>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
