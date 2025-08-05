import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import iconv from 'iconv-lite';

// データファイルのパスを定義
const DATA_DIR = path.join(process.cwd(), 'data');

// JSONデータを読み込むヘルパー関数
async function readDataFile(dataType: string): Promise<any[] | null> {
  const filePath = path.join(DATA_DIR, `${dataType}.json`);
  try {
    const data = await fs.readFile(filePath, 'utf8');
    const jsonData = JSON.parse(data);
    // 会社情報のようにオブジェクト単体で保存されている場合も配列に変換
    return Array.isArray(jsonData) ? jsonData : [jsonData];
  } catch (error: any) {
    if (error.code === 'ENOENT') return null; // ファイルが存在しない場合はnullを返す
    throw error;
  }
}

// JSONをCSVに変換するヘルパー関数
function convertToCSV(data: any[]): string {
  if (!data || data.length === 0) {
    return '';
  }

  const allKeys = data.reduce((keys, obj) => {
    Object.keys(obj).forEach(key => {
      if (!keys.includes(key)) {
        keys.push(key);
      }
    });
    return keys;
  }, [] as string[]);

  const csvHeader = allKeys.join(',');

  const csvBody = data.map(row => {
    return allKeys.map((header: string) => {
      const value = row[header];
      const strValue = String(value ?? '');
      if (/[,"\n]/.test(strValue)) {
        return `"${strValue.replace(/"/g, '""')}"`;
      }
      return strValue;
    }).join(',');
  }).join('\n');

  return `${csvHeader}\n${csvBody}`;
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get('type');

  if (!dataType) {
    return NextResponse.json({ error: 'データタイプが指定されていません。' }, { status: 400 });
  }

  try {
    let data = await readDataFile(dataType);

    if (!data) {
      return NextResponse.json({ error: '指定されたデータが見つかりません。' }, { status: 404 });
    }

    // フィルターを適用
    searchParams.forEach((value, key) => {
      if (key !== 'type') {
        data = data!.filter(item => 
          String(item[key] ?? '').toLowerCase().includes(value.toLowerCase())
        );
      }
    });

    const csv = convertToCSV(data);
    const sjisCsv = iconv.encode(csv, 'Shift_JIS');
    const uint8Array = new Uint8Array(sjisCsv);

    return new NextResponse(uint8Array, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=shift_jis',
        'Content-Disposition': `attachment; filename="${dataType}.csv"`,
      },
    });

  } catch (error) {
    console.error('Export failed:', error);
    return NextResponse.json({ error: 'エクスポートに失敗しました。' }, { status: 500 });
  }
}