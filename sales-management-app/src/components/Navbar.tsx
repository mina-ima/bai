'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';

export default function Navbar() {
  return (
    <nav style={{
      width: '200px',
      height: '100vh',
      backgroundColor: '#2c3e50',
      padding: '20px',
      boxSizing: 'border-box',
      color: 'white',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
    }}>
      <h2 style={{ color: '#ecf0f1', marginBottom: '20px' }}>メニュー</h2>
      <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
        <li style={{ marginBottom: '10px' }}><Link href="/" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>ホーム</Link></li>
        <li style={{ marginBottom: '10px' }}><Link href="/deliveries" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>納品</Link></li>
        <li style={{ marginBottom: '10px' }}><Link href="/invoices" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>請求</Link></li>
        <li style={{ marginBottom: '10px' }}><Link href="/products" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>商品マスタ</Link></li>
        <li style={{ marginBottom: '10px' }}><Link href="/customers" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>取引先マスタ</Link></li>
        <li style={{ marginBottom: '10px' }}><Link href="/users" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>ユーザー管理</Link></li>
        <li style={{ marginBottom: '10px' }}><Link href="/data-processing" style={{ color: 'white', textDecoration: 'none', fontSize: '1.1em' }}>データ処理</Link></li>
      </ul>
      <button
        onClick={() => signOut({ callbackUrl: '/login' })}
        style={{
          padding: '10px 15px',
          backgroundColor: '#e74c3c',
          color: 'white',
          border: 'none',
          borderRadius: '5px',
          cursor: 'pointer',
          fontSize: '1em',
          marginTop: '20px',
        }}
      >
        ログアウト
      </button>
    </nav>
  );
}
