import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// 商品削除
export async function DELETE(
  request: Request,
  { params }: any
) {
  const id = params.id;
  try {
    await prisma.product.delete({
      where: { product_id: id },
    });
    return new NextResponse(null, { status: 204 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}