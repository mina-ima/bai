import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { parse } from 'csv-parse/sync';
import { getNextProductId } from '@/lib/productUtils';


const DATA_DIR = path.join(process.cwd(), 'public', 'data');

// 各データタイプのファイルパスとIDフィールドの定義
const DATA_CONFIG: { [key: string]: { filePath: string; idField: string; } } = {
  company_info: { filePath: path.join(DATA_DIR, 'company_info.json'), idField: 'company_name' }, // company_nameをユニークIDとして扱う
  customer_list: { filePath: path.join(DATA_DIR, 'customer_list.json'), idField: 'customer_id' },
  product_list: { filePath: path.join(DATA_DIR, 'product_list.json'), idField: 'product_id' },
  user_list: { filePath: path.join(DATA_DIR, 'user_list.json'), idField: 'user_id' },
  delivery_list: { filePath: path.join(DATA_DIR, 'delivery_list.json'), idField: 'delivery_id' },
};

async function readJsonFile(filePath: string): Promise<any[]> {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    return Array.isArray(jsonData) ? jsonData : [jsonData];
  } catch (error: any) {
    if (error.code === 'ENOENT') return [];
    throw error;
  }
}

async function writeJsonFile(filePath: string, data: any[], dataType: string): Promise<void> {
  const content = dataType === 'company_info' && data.length > 0 ? data[0] : data;
  await fs.writeFile(filePath, JSON.stringify(content, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as Blob | null;
    const dataType = formData.get('dataType') as string | null;

    if (!file || !dataType) {
      return NextResponse.json({ error: 'ファイルとデータタイプが必要です。' }, { status: 400 });
    }

    const config = DATA_CONFIG[dataType];
    if (!config) {
      return NextResponse.json({ error: '無効なデータタイプです。' }, { status: 400 });
    }

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const csvString = fileBuffer.toString('utf8');

    const records = parse(csvString, { 
      columns: true, 
      skip_empty_lines: true, 
      trim: true, 
      bom: true 
    });

    const existingData = await readJsonFile(config.filePath);

    // 会社情報の場合は既存データを上書き
    if (dataType === 'company_info') {
      if (records.length > 1) {
        return NextResponse.json({ error: '会社情報は1件のみインポート可能です。' }, { status: 400 });
      }
      await writeJsonFile(config.filePath, records, dataType);
      return NextResponse.json({ message: '会社情報が正常にインポートされました。' });
    }

    // その他のデータタイプはIDに基づいて更新または追加
    for (let record of records) {
      // データ型に応じて型変換を行う
      if (dataType === 'product_list') {
        record = {
          ...(record as any),
          product_unitPrice: (record as any).product_unitPrice ? parseFloat((record as any).product_unitPrice) : 0,
          product_tax: (record as any).product_tax ? parseInt((record as any).product_tax, 10) : 0,
        };
      } else if (dataType === 'delivery_list') {
        // Temporarily store parsed numeric values
        const parsedQuantity = (record as any).quantity ? parseInt((record as any).quantity, 10) : 0;
        const parsedUnitPrice = (record as any).unit_price ? parseFloat((record as any).unit_price) : 0;
        const parsedDeliveryTax = (record as any).delivery_tax ? parseInt((record as any).delivery_tax, 10) : 0;
        const parsedTotalAmount = (record as any).total_amount ? parseFloat((record as any).total_amount) : 0;
        const parsedDeliveryQuantity = (record as any).delivery_quantity ? parseInt((record as any).delivery_quantity, 10) : 0;
        const parsedDeliveryTotalPrice = (record as any).delivery_total_price ? parseFloat((record as any).delivery_total_price) : 0;

        record = {
          ...(record as any),
          quantity: parsedQuantity,
          unit_price: parsedUnitPrice,
          delivery_tax: parsedDeliveryTax,
          delivery_quantity: parsedDeliveryQuantity,
          delivery_total_price: parsedDeliveryTotalPrice,
        };

        // total_amountがNaN、0、または空欄の場合、unit_price * quantityで計算
        if (isNaN(parsedTotalAmount) || parsedTotalAmount === 0) {
          (record as any).total_amount = parsedUnitPrice * parsedQuantity;
        } else {
          (record as any).total_amount = parsedTotalAmount;
        }
      }

      let id = (record as any)[config.idField];
      if (!id) {
        if (dataType === 'product_list') {
          id = await getNextProductId();
          (record as any)[config.idField] = id;
        } else {
          console.warn(`Skipping record due to missing ID field (${config.idField}):`, record);
          continue;
        }
      }

      const index = existingData.findIndex(item => item[config.idField] === id);
      if (index !== -1) {
        // 既存のレコードを更新
        existingData[index] = { ...existingData[index], ...(record as any) };
      } else {
        // 新しいレコードを追加
        existingData.push(record);
      }
    }

    await writeJsonFile(config.filePath, existingData, dataType);

    return NextResponse.json({ message: 'データが正常にインポートされました。' });
  } catch (error) {
    console.error('Import error:', error);
    return NextResponse.json({ error: 'インポート中にエラーが発生しました。' }, { status: 500 });
  }
}
