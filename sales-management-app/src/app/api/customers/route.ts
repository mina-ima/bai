import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 取引先一覧取得
export async function GET() {
  try {
    const customers = await prisma.customer.findMany();
    return NextResponse.json(customers);
  } catch (error) {
    console.error('Error fetching customers:', error);
    if (error instanceof Error) {
      console.error('Error name:', error.name);
      console.error('Error message:', error.message);
      console.error('Error stack:', error.stack);
    }
    return NextResponse.json({ error: 'Failed to fetch customers', details: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
}

// 取引先登録
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newCustomer = await prisma.customer.create({ data: body });
    return NextResponse.json(newCustomer, { status: 201 });
  } catch (error) {
    console.error('Error creating customer:', error);
    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
  }
}
