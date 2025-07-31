'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';
import Link from 'next/link';

export default function MasterRegistrationPage() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-[800px] mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">マスタ登録メニュー</h1>
        <div className="flex flex-col space-y-4">
          <Link href="/products" className="w-full py-4 px-8 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 text-2xl text-center">
            商品登録
          </Link>
          <Link href="/customers" className="w-full py-4 px-8 bg-green-600 text-white font-semibold rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 text-2xl text-center">
            取引先登録
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
