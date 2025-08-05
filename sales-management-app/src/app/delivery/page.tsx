
'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import Link from 'next/link';

export default function DeliveryPage() {
  return (
    <AuthenticatedLayout>
      <div className="w-full mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">納品管理</h1>
        <div className="flex justify-center space-x-8">
          <Link href="/delivery/register" passHref>
            <button className="w-64 h-24 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-2xl">
              納品登録
            </button>
          </Link>
          <Link href="/delivery/search" passHref>
            <button className="w-64 h-24 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-2xl">
              納品検索
            </button>
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
