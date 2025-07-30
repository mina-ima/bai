'use client';

import { useState } from 'react';
import Link from 'next/link';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

export default function Home() {
  // 状況表示のためにダミーデータを取得するロジックは残しておく
  const [unissuedDeliveries, setUnissuedDeliveries] = useState(5);
  const [unsentInvoices, setUnsentInvoices] = useState(3);
  const [alerts, setAlerts] = useState(['支払期限が近い請求書があります。']);

  return (
    <AuthenticatedLayout>
      <div style={{ padding: '20px' }}>
        <h1>ダッシュボード</h1>
        {/* <p>ようこそ、{session.user?.name}さん！</p> */}

        {/* 状況表示 */} 
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '20px', marginTop: '30px' }}>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3>未発行の納品書</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#007bff' }}>{unissuedDeliveries}件</p>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3>未送付の請求書</h3>
            <p style={{ fontSize: '2em', fontWeight: 'bold', color: '#dc3545' }}>{unsentInvoices}件</p>
          </div>
          <div style={{ border: '1px solid #ddd', borderRadius: '8px', padding: '20px', backgroundColor: '#fff' }}>
            <h3>直近のアラート</h3>
            {alerts.length > 0 ? (
              alerts.map((alert, index) => (
                <p key={index} style={{ color: '#ffc107' }}>{alert}</p>
              ))
            ) : (
              <p>現在、アラートはありません。</p>
            )}
          </div>
        </div>

        {/* メニュー選択カード */} 
        <h2 style={{ marginTop: '40px', marginBottom: '20px' }}>機能選択</h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px' }}>
          <Link href="/deliveries" style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #007bff', borderRadius: '8px', padding: '20px', backgroundColor: '#e7f3ff', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <h3 style={{ color: '#007bff' }}>納品</h3>
              <p style={{ color: '#555', fontSize: '0.9em' }}>納品登録・検索・一覧</p>
            </div>
          </Link>
          <Link href="/invoices" style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #28a745', borderRadius: '8px', padding: '20px', backgroundColor: '#e6ffe9', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <h3 style={{ color: '#28a745' }}>請求</h3>
              <p style={{ color: '#555', fontSize: '0.9em' }}>請求書作成・管理</p>
            </div>
          </Link>
          <Link href="/products" style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #ffc107', borderRadius: '8px', padding: '20px', backgroundColor: '#fff8e6', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <h3 style={{ color: '#ffc107' }}>商品マスタ</h3>
              <p style={{ color: '#555', fontSize: '0.9em' }}>商品情報の登録・編集</p>
            </div>
          </Link>
          <Link href="/customers" style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #6f42c1', borderRadius: '8px', padding: '20px', backgroundColor: '#f2e6ff', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <h3 style={{ color: '#6f42c1' }}>取引先マスタ</h3>
              <p style={{ color: '#555', fontSize: '0.9em' }}>取引先情報の登録・編集</p>
            </div>
          </Link>
          <Link href="/users" style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #17a2b8', borderRadius: '8px', padding: '20px', backgroundColor: '#e0f7fa', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <h3 style={{ color: '#17a2b8' }}>ユーザー管理</h3>
              <p style={{ color: '#555', fontSize: '0.9em' }}>ユーザーの登録・権限設定</p>
            </div>
          </Link>
          <Link href="/data-processing" style={{ textDecoration: 'none' }}>
            <div style={{ border: '1px solid #6c757d', borderRadius: '8px', padding: '20px', backgroundColor: '#f0f2f5', textAlign: 'center', cursor: 'pointer', transition: 'all 0.3s ease' }}>
              <h3 style={{ color: '#6c757d' }}>データ処理</h3>
              <p style={{ color: '#555', fontSize: '0.9em' }}>CSVインポート・エクスポート</p>
            </div>
          </Link>
        </div>
      </div>
    </AuthenticatedLayout>
  );
}