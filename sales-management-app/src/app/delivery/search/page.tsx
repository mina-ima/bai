'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import { useEffect, useState } from 'react';
import { Delivery } from '@/types/delivery';

export default function DeliverySearchPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliveries = async () => {
    try {
      const response = await fetch('/api/delivery');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data: Delivery[] = await response.json();
      setDeliveries(data);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDeliveries();
  }, []);

  const handleDelete = async (deliveryId: string) => {
    if (!confirm(`納品ID: ${deliveryId} を削除してもよろしいですか？`)) {
      return;
    }
    try {
      const response = await fetch(`/api/delivery?delivery_id=${deliveryId}`, {
        method: 'DELETE',
      });
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      // 削除成功後、リストを再フェッチ
      fetchDeliveries();
    } catch (e: any) {
      setError(e.message);
    }
  };

  if (loading) {
    return (
      <AuthenticatedLayout>
        <div className="w-full mx-auto p-8">
          <h1 className="text-size-30 font-bold text-center mb-8">納品検索</h1>
          <p>読み込み中...</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  if (error) {
    return (
      <AuthenticatedLayout>
        <div className="w-full mx-auto p-8">
          <h1 className="text-size-30 font-bold text-center mb-8">納品検索</h1>
          <p className="text-red-500">エラー: {error}</p>
        </div>
      </AuthenticatedLayout>
    );
  }

  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">納品検索</h1>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-200">
            <thead>
              <tr>
                <th className="py-2 px-4 border-b">納品ID</th>
                <th className="py-2 px-4 border-b">納品番号</th>
                <th className="py-2 px-4 border-b">納品書番号</th>
                <th className="py-2 px-4 border-b">納品日</th>
                <th className="py-2 px-4 border-b">顧客名</th>
                <th className="py-2 px-4 border-b">製品名</th>
                <th className="py-2 px-4 border-b">数量</th>
                <th className="py-2 px-4 border-b">単価</th>
                <th className="py-2 px-4 border-b">合計金額</th>
                <th className="py-2 px-4 border-b">アクション</th>
              </tr>
            </thead>
            <tbody>
              {deliveries.map((delivery) => (
                <tr key={delivery.delivery_id}>
                  <td className="py-2 px-4 border-b">{delivery.delivery_id}</td>
                  <td className="py-2 px-4 border-b">{delivery.delivery_number}</td>
                  <td className="py-2 px-4 border-b">{delivery.delivery_invoiceNumber}</td>
                  <td className="py-2 px-4 border-b">{delivery.delivery_date}</td>
                  <td className="py-2 px-4 border-b">{delivery.customer_name}</td>
                  <td className="py-2 px-4 border-b">{delivery.product_name}</td>
                  <td className="py-2 px-4 border-b">{delivery.quantity}</td>
                  <td className="py-2 px-4 border-b">{delivery.unit_price}</td>
                  <td className="py-2 px-4 border-b">{delivery.total_amount}</td>
                  <td className="py-2 px-4 border-b">
                    <button
                      onClick={() => handleDelete(delivery.delivery_id)}
                      className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded"
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
    </AuthenticatedLayout>
  );
}