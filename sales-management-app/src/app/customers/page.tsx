'use client';

import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function CustomersPage() {
  return (
    <AuthenticatedLayout>
      <div className="max-w-[800px] mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">取引先登録ページ</h1>
        <p className="text-center">ここに取引先登録フォームが実装されます。</p>
      </div>
    </AuthenticatedLayout>
  );
}
