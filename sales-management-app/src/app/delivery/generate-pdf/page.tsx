'use client';

import React from 'react';
import { DeliveryNotePdfProps } from '@/components/DeliveryNotePdf';

const DeliveryGeneratePdfPage: React.FC = () => {
  const handleGeneratePdf = async () => {
    // 仮のデータ。実際にはフォーム入力やAPIから取得したデータを使用します。
    const dummyData: DeliveryNotePdfProps = {
      deliveryNoteNumber: 'DN-20231027-001',
      deliveryDate: '2023/10/27',
      companyInfo: {
        name: '株式会社自社',
        postalCode: '100-0001',
        address: '東京都千代田区千代田1-1-1',
        phone: '03-1234-5678',
        fax: '03-1234-5679',
        bankName: '〇〇銀行',
        branchName: '△△支店',
        accountType: '普通',
        accountNumber: '1234567',
        personInCharge: '山田太郎', // 担当者 -> personInCharge に変更
      },
      customerInfo: {
        code: 'CUST001',
        postalCode: '530-0001',
        address: '大阪府大阪市北区梅田1-1-1',
        name: '株式会社取引先',
      },
      deliveryItems: [
        { productCode: 'PROD001', quantity: 10, unit: '個', unitPrice: 1000, remarks: 'テスト商品A' },
        { productCode: 'PROD002', quantity: 5, unit: 'セット', unitPrice: 5000, remarks: 'テスト商品B' },
        { productCode: 'PROD003', quantity: 2, unit: '枚', unitPrice: 2000, remarks: 'テスト商品C' },
      ],
    };

    console.log('handleGeneratePdf called');
    try {
      const response = await fetch('/api/delivery/generate-pdf', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dummyData),
      });

      console.log('Response status:', response.status);
      console.log('Response status text:', response.statusText);
      console.log('Response ok:', response.ok);

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'delivery_note.pdf';
        document.body.appendChild(a);
        a.click();
        a.remove();
        window.URL.revokeObjectURL(url);
      } else {
        const errorText = await response.text();
        console.error('Failed to generate PDF:', response.statusText, errorText);
        alert('PDF生成に失敗しました。詳細をコンソールで確認してください。');
      }
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('PDF生成中にエラーが発生しました。');
    }
  };

  return (
    <div>
      <h1>納品書発行機能</h1>
      <button onClick={handleGeneratePdf}>納品書PDFを生成</button>
    </div>
  );
};

export default DeliveryGeneratePdfPage;
