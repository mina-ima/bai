import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const customersFilePath = path.join(process.cwd(), 'data', 'customer_list.json');

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
    newCustomer.customer_id = uuidv4(); // 自動付番

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
