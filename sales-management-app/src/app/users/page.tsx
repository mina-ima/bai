'use client';

import React, { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface User {
  user_id: string;
  user_name: string;
  user_authority: string;
}

const UsersPage = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [userId, setUserId] = useState('');
  const [userName, setUserName] = useState('');
  const [userPass, setUserPass] = useState('');
  const [userAuthority, setUserAuthority] = useState('管理者');

  const fetchUsers = async () => {
    console.log('Fetching users...'); // デバッグ用ログ
    try {
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(Array.isArray(data) ? data : []);
        console.log('Users fetched successfully:', data); // デバッグ用ログ
      } else {
        console.error('Failed to fetch users. Status:', response.status); // デバッグ用ログ
        const errorText = await response.text(); // エラーレスポンスの本文を取得
        console.error('Error response body:', errorText); // デバッグ用ログ
      }
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const newUser: User = {
      user_id: userId,
      user_name: userName,
      user_authority: userAuthority,
    };

    try {
      const response = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newUser),
      });

      if (response.ok) {
        alert('ユーザーが登録されました！');
        setUserId('');
        setUserName('');
        setUserPass('');
        setUserAuthority('管理者');
        fetchUsers(); // ユーザーリストを更新
      } else {
        alert('ユーザー登録に失敗しました。');
      }
    } catch (error) {
      console.error('Error registering user:', error);
      alert('ユーザー登録中にエラーが発生しました。');
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm(`ユーザーID: ${id} を削除しますか？`)) {
      try {
        const response = await fetch(`/api/users/${id}`, {
          method: 'DELETE',
        });

        if (response.ok) {
          alert('ユーザーが削除されました。');
          fetchUsers(); // ユーザーリストを更新
        } else {
          alert('ユーザー削除に失敗しました。');
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        alert('ユーザー削除中にエラーが発生しました。');
      }
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="w-4/5 mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center">ユーザー登録</h1>
        <form onSubmit={handleRegister} className="bg-white shadow-md rounded-lg p-8 mb-8">
          <div className="mb-6 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-1/3" htmlFor="userId">
                ユーザーID：
              </label>
              <input
                className="w-2/3 p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500"
                id="userId"
                type="text"
                placeholder="半角英数の一意のID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-1/3" htmlFor="userAuthority">
                ユーザー権限：
              </label>
              <select
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="userAuthority"
                value={userAuthority}
                onChange={(e) => setUserAuthority(e.target.value)}
              >
                <option>管理者</option>
                <option>一般</option>
                <option>納品</option>
                <option>閲覧</option>
              </select>
            </div>
          </div>
          <div className="mb-6 flex space-x-4">
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="userName">
                ユーザー名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="userName"
                type="text"
                placeholder="ユーザー名"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                required
              />
            </div>
            <div className="w-1/2 flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[120px] flex-shrink-0" htmlFor="userPass">
                ユーザーPASS：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="userPass"
                type="password"
                placeholder="半角英数"
                value={userPass}
                onChange={(e) => setUserPass(e.target.value)}
                required
              />
            </div>
          </div>
          <div className="flex items-center justify-center">
            <button
              className="w-full py-4 px-8 bg-blue-600 text-white font-semibold rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 mt-4 text-2xl"
              type="submit"
            >
              登録
            </button>
          </div>
        </form>

        <h2 className="text-size-30 font-bold text-center mt-[50px]">ユーザーリスト</h2>
        <div className="mt-8">
          <div className="overflow-x-auto">
            <table className="min-w-full border-collapse border-[3px] border-blue-600">
              <thead>
                <tr>
                  <th className="py-3 px-6 bg-blue-600 text-white font-bold uppercase text-base text-left border-[3px] border-blue-600">ユーザーID</th>
                  <th className="py-3 px-6 bg-blue-600 text-white font-bold uppercase text-base text-left border-[3px] border-blue-600">ユーザー名</th>
                  <th className="py-3 px-6 bg-blue-600 text-white font-bold uppercase text-base text-left border-[3px] border-blue-600">ユーザー権限</th>
                  <th className="py-3 px-6 bg-blue-600 text-white font-bold uppercase text-base text-left border-[3px] border-blue-600">操作</th>
                </tr>
              </thead>
              <tbody>
                {users.map((user) => (
                  <tr key={user.user_id} className="even:bg-gray-50 hover:bg-gray-100">
                    <td className="py-3 px-6 text-left border-[3px] border-blue-600 text-base">{user.user_id}</td>
                    <td className="py-3 px-6 text-left border-[3px] border-blue-600 text-base">{user.user_name}</td>
                    <td className="py-3 px-6 text-left border-[3px] border-blue-600 text-base">{user.user_authority}</td>
                    <td className="py-3 px-6 text-left border-[3px] border-blue-600">
                      <button
                        className="bg-red-500 hover:bg-red-700 text-white font-bold py-1 px-2 rounded text-xs"
                        onClick={() => handleDelete(user.user_id)}
                      >
                        削除
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </AuthenticatedLayout>
  );
};

export default UsersPage;
