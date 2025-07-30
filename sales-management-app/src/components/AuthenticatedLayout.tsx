'use client';

import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import Navbar from './Navbar';

export default function AuthenticatedLayout({
  children,
}: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  useEffect(() => {
    if (status === 'loading') return; // セッションの読み込み中は何もせず待機
    if (!session) {
      router.push('/login'); // ログインしていない場合はログインページへリダイレクト
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    // ログインページへのリダイレクト中、またはセッション読み込み中の表示
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      <Navbar />
      <main style={{ flexGrow: 1, padding: '20px', backgroundColor: '#f8f9fa' }}>
        {children}
      </main>
    </div>
  );
}