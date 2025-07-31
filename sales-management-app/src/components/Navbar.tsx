'use client';

import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useRouter } from 'next/navigation';

const NavLink = ({ href, children }: { href: string, children: React.ReactNode }) => (
    <li style={{ marginBottom: '12px' }}>
        <Link href={href} style={{
            color: '#ecf0f1',
            textDecoration: 'none',
            fontSize: '1.1em',
            display: 'block',
            padding: '8px 15px',
            borderRadius: '5px',
            transition: 'background-color 0.2s ease'
        }}>
            {children}
        </Link>
    </li>
);

export default function Navbar() {
    const router = useRouter();
    const menuItems = [
        { href: '/deliveries', title: '納品機能' },
        { href: '/invoices', title: '請求機能' },
        { href: '/master_registration', title: 'マスタ登録' },
        { href: '/company', title: '企業情報登録' },
        { href: '/data-processing', title: 'データ処理' },
        { href: '/users', title: 'ユーザー管理' },
    ];

    return (
        <nav style={{
            width: '240px',
            height: '100vh',
            backgroundColor: '#2c3e50',
            padding: '20px',
            boxSizing: 'border-box',
            color: 'white',
            display: 'flex',
            flexDirection: 'column',
        }}>
            <h2 style={{ color: '#ecf0f1', marginBottom: '30px', textAlign: 'center', fontSize: '1.5rem' }}>メインメニュー</h2>
            <ul style={{ listStyle: 'none', padding: 0, margin: 0, flexGrow: 1 }}>
                <NavLink href="/">ホーム</NavLink>
                {menuItems.map(item => (
                    <NavLink key={item.href} href={item.href}>{item.title}</NavLink>
                ))}
            </ul>
            <button
                onClick={async () => {
                    console.log('Logout button clicked');
                    await signOut({ redirect: false });
                    router.push('/login');
                }}
                style={{
                    padding: '12px 15px',
                    backgroundColor: '#e74c3c',
                    color: 'white',
                    border: 'none',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    fontSize: '1em',
                    marginTop: '20px',
                    transition: 'background-color 0.2s ease'
                }}
            >
                ログアウト
            </button>
        </nav>
    );
}
