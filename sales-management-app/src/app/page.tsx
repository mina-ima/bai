'use client';

import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

// A single button component for styling consistency
const MenuButton = ({ href, color, title, description }: { href: string, color: string, title: string, description: string }) => (
  <Link href={href} style={{ textDecoration: 'none' }}>
    <div style={{
      border: `2px solid ${color}`,
      borderRadius: '12px',
      padding: '25px 20px',
      backgroundColor: `${color}20`, // Lighter shade of the border color
      textAlign: 'center',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center'
    }}>
      <h3 style={{ color: color, margin: 0, fontSize: '1.5rem' }}>{title}</h3>
      <p style={{ color: '#555', fontSize: '0.9em', marginTop: '8px' }}>{description}</p>
    </div>
  </Link>
);

export default function Home() {
  const menuItems = [
    { href: '/deliveries', color: '#007bff', title: '納品機能', description: '納品登録・検索・一覧' },
    { href: '/invoices', color: '#28a745', title: '請求機能', description: '請求書作成・管理' },
    { href: '/master_registration', color: '#6f42c1', title: 'マスタ登録', description: '商品・取引先の登録・編集' },
    { href: '/company', color: '#fd7e14', title: '企業情報登録', description: '自社情報の登録・編集' },
    { href: '/data_processing', color: '#6c757d', title: 'データ処理', description: 'CSVインポート・エクスポート' },
    { href: '/users', color: '#17a2b8', title: 'ユーザー管理', description: 'ユーザーの登録・権限設定' },
  ];

  return (
    <AuthenticatedLayout>
      <div style={{ padding: '20px' }}>
        <h1 style={{ textAlign: 'center', marginBottom: '40px' }}>メインメニュー</h1>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))',
          gap: '25px',
          maxWidth: '900px',
          margin: '0 auto'
        }}>
          {menuItems.map(item => (
            <MenuButton key={item.href} {...item} />
          ))}
        </div>
      </div>
    </AuthenticatedLayout>
  );
}