import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 商品一覧取得
export async function GET() {
  try {
    const products = await prisma.product.findMany();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// 商品登録
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newProduct = await prisma.product.create({ data: body });
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}
