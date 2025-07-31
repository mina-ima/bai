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
    console.log('AuthenticatedLayout useEffect - status:', status, 'session:', session);
    if (status === 'loading') return; // セッションの読み込み中は何もせず待機
    if (!session) {
      console.log('AuthenticatedLayout: No session found, redirecting to /login');
      router.push('/login'); // ログインしていない場合はログインページへリダイレクト
    }
  }, [session, status, router]);

  if (status === 'loading' || !session) {
    // ログインページへのリダイレクト中、またはセッション読み込み中の表示
    return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>Loading...</div>;
  }

  return (
    <div className="flex min-h-screen">
      <Navbar />
      <main className="flex-grow p-5 bg-gray-100 flex flex-col items-center overflow-y-auto h-screen">
        {children}
      </main>
    </div>
  );
}