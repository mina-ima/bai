import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// customersFilePath のパスを修正
const customersFilePath = path.join(process.cwd(), 'public', 'data', 'customer_list.json');

interface Customer {
  customer_id: string;
  // 他のプロパティもここに追加
}

async function getNextCustomerId(): Promise<string> {
  let customers: Customer[] = [];
  try {
    const customersData = fs.readFileSync(customersFilePath, 'utf-8');
    customers = JSON.parse(customersData);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // ファイルが存在しない場合は空のリストとして扱う
      customers = [];
    } else {
      throw error;
    }
  }

  let maxIdNum = 0;
  customers.forEach(customer => {
    const idMatch = customer.customer_id.match(/^C(\d{6})$/);
    if (idMatch) {
      const idNum = parseInt(idMatch[1], 10);
      if (!isNaN(idNum) && idNum > maxIdNum) {
        maxIdNum = idNum;
      }
    }
  });

  const nextIdNum = maxIdNum + 1;
  // 6桁のゼロ埋め
  const nextId = `C${String(nextIdNum).padStart(6, '0')}`;
  return nextId;
}

export async function GET() {
  try {
    const customersData = fs.readFileSync(customersFilePath, 'utf-8');
    const customers = JSON.parse(customersData);
    return NextResponse.json(customers);
  } catch (error: unknown) {
    if (typeof error === 'object' && error !== null && 'code' in error && (error as { code: string }).code === 'ENOENT') {
      // ファイルが存在しない場合は空の配列を返す
      return NextResponse.json([], { status: 200 });
    }
    console.error('Error reading customers data:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const newCustomer = await req.json();
    newCustomer.customer_id = await getNextCustomerId(); // 新しいIDを生成

    const customersData = fs.readFileSync(customersFilePath, 'utf-8');
    const customers = JSON.parse(customersData);
    customers.push(newCustomer);
    fs.writeFileSync(customersFilePath, JSON.stringify(customers, null, 2), 'utf-8');
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error adding customer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}