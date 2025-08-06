'use client';

import React from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

const DeliveryIndexPage: React.FC = () => {
  return (
    <AuthenticatedLayout>
      <div className="flex flex-col items-center min-h-screen pt-8">
        <h1 className="text-4xl font-bold mb-8">納品機能</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link href="/delivery/register" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-center text-xl transition duration-300 ease-in-out transform hover:scale-105">
            納品登録
          </Link>
          <Link href="/delivery/search" className="bg-green-500 hover:bg-green-700 text-white font-bold py-4 px-8 rounded-lg shadow-lg text-center text-xl transition duration-300 ease-in-out transform hover:scale-105">
            納品検索
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default DeliveryIndexPage;
