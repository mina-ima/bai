'use client';

import { useState, useEffect } from 'react';
import AuthenticatedLayout from '@/components/AuthenticatedLayout';

interface CompanyInfoState {
  company_name: string;
  company_postalCode: string;
  company_address: string;
  company_phone: string;
  company_fax: string;
  company_mail: string;
  company_contactPerson: string;
  company_bankName: string;
  company_bankBranch: string;
  company_bankType: string;
  company_bankNumber: string;
  company_bankHolder: string;
  company_invoiceNumber: string;
}

export default function CompanyInfoPage() {
  const [formData, setFormData] = useState<CompanyInfoState>({
    company_name: '',
    company_postalCode: '',
    company_address: '',
    company_phone: '',
    company_fax: '',
    company_mail: '',
    company_contactPerson: '',
    company_bankName: '',
    company_bankBranch: '',
    company_bankType: '',
    company_bankNumber: '',
    company_bankHolder: '',
    company_invoiceNumber: '',
  });

  useEffect(() => {
    const fetchCompanyInfo = async () => {
      try {
        const response = await fetch('/api/company');
        if (response.ok) {
          const data = await response.json();
          setFormData(data);
        } else if (response.status === 404) {
          console.log('Company info not found, starting with empty form.');
        } else {
          console.error('Failed to fetch company info:', response.statusText);
        }
      } catch (error) {
        console.error('An error occurred while fetching company info:', error);
      }
    };

    fetchCompanyInfo();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting form data:', formData);
    try {
      const response = await fetch('/api/company', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();
      console.log('API response:', result);

      if (response.ok) {
        alert('企業情報が正常に保存されました。');
      } else {
        alert(`エラーが発生しました: ${result.error || response.statusText}。もう一度お試しください。`);
      }
    } catch (error) {
      console.error('An unexpected error occurred:', error);
      alert('予期せぬエラーが発生しました。');
    }
  };

  return (
    <AuthenticatedLayout>
      <div className="max-w-7xl mx-auto p-8">
        <h1 className="text-size-30 font-bold text-center mb-8">企業情報登録</h1>
        <form onSubmit={handleSubmit} className="bg-white shadow-md rounded-lg p-8 mb-8">
          {/* Row 1 */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="company_name">
                自社名：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_name"
                type="text"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="company_contactPerson">
                自社担当者：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_contactPerson"
                type="text"
                name="company_contactPerson"
                value={formData.company_contactPerson}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[220px] flex-shrink-0" htmlFor="company_invoiceNumber">
                自社適格請求書番号：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_invoiceNumber"
                type="text"
                name="company_invoiceNumber"
                value={formData.company_invoiceNumber}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 2 */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="company_postalCode">
                自社〒：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_postalCode"
                type="text"
                name="company_postalCode"
                value={formData.company_postalCode}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="company_address">
                自社住所：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_address"
                type="text"
                name="company_address"
                value={formData.company_address}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 3 */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="company_phone">
                自社電話：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_phone"
                type="text"
                name="company_phone"
                value={formData.company_phone}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="company_fax">
                自社FAX：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_fax"
                type="text"
                name="company_fax"
                value={formData.company_fax}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[140px] flex-shrink-0" htmlFor="company_mail">
                自社Mail：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_mail"
                type="text"
                name="company_mail"
                value={formData.company_mail}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 4 */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[220px] flex-shrink-0" htmlFor="company_bankName">
                自社口座（銀行名）：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_bankName"
                type="text"
                name="company_bankName"
                value={formData.company_bankName}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[220px] flex-shrink-0" htmlFor="company_bankBranch">
                自社口座（支店名）：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_bankBranch"
                type="text"
                name="company_bankBranch"
                value={formData.company_bankBranch}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[220px] flex-shrink-0" htmlFor="company_bankType">
                自社口座（口座種）：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_bankType"
                type="text"
                name="company_bankType"
                value={formData.company_bankType}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Row 5 */}
          <div className="mb-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[220px] flex-shrink-0" htmlFor="company_bankNumber">
                自社口座（口座番号）：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_bankNumber"
                type="text"
                name="company_bankNumber"
                value={formData.company_bankNumber}
                onChange={handleChange}
              />
            </div>
            <div className="flex-1 min-w-[300px] flex items-center">
              <label className="text-gray-700 text-size-20 font-medium w-[220px] flex-shrink-0" htmlFor="company_bankHolder">
                自社口座（口座名義）：
              </label>
              <input
                className="flex-grow p-3 border border-gray-300 rounded-md text-size-20 focus:outline-none focus:ring-2 focus:ring-blue-500 h-12"
                id="company_bankHolder"
                type="text"
                name="company_bankHolder"
                value={formData.company_bankHolder}
                onChange={handleChange}
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
      </div>
    </AuthenticatedLayout>
  );
}