'use client';

import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function DataProcessingMenuPage() {
  const menuItems = [
    { href: '/data_processing/import', title: 'インポート', disabled: false },
    { href: '/data_processing/export', title: 'エクスポート', disabled: false },
    { href: '/data_processing/aggregate', title: '集計', disabled: true },
    { href: '/data_processing/reset', title: 'リセット', disabled: true },
  ];

  return (
    <AuthenticatedLayout>
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-3xl font-bold text-center mb-8">データ処理</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {menuItems.map((item) => {
            const commonClasses = "w-full py-4 px-8 text-white font-semibold rounded-md text-2xl text-center";
            if (item.disabled) {
              return (
                <button
                  key={item.href}
                  disabled
                  className={`${commonClasses} bg-gray-400 cursor-not-allowed`}
                >
                  {item.title}
                </button>
              );
            }
            let buttonColorClass = '';
            switch (item.href) {
              case '/data_processing/import':
                buttonColorClass = 'bg-blue-600 hover:bg-blue-700';
                break;
              case '/data_processing/export':
                buttonColorClass = 'bg-green-600 hover:bg-green-700';
                break;
              case '/data_processing/aggregate':
                buttonColorClass = 'bg-yellow-600 hover:bg-yellow-700';
                break;
              case '/data_processing/reset':
                buttonColorClass = 'bg-red-600 hover:bg-red-700';
                break;
              default:
                buttonColorClass = 'bg-gray-600 hover:bg-gray-700';
            }
            return (
              <Link key={item.href} href={item.href} className={`${commonClasses} ${buttonColorClass} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}>
                  {item.title}
              </Link>
            );
          })}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}
