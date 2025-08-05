import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { getNextProductId } from '@/lib/productUtils';

const PRODUCT_LIST_PATH = path.join(process.cwd(), 'data', 'product_list.json');



async function readProductsFile(): Promise<Product[]> {
  try {
    const data = await fs.readFile(PRODUCT_LIST_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // ファイルが存在しない場合は空の配列を返す
      return [];
    }
    throw error;
  }
}

async function writeProductsFile(products: Product[]): Promise<void> {
  await fs.writeFile(PRODUCT_LIST_PATH, JSON.stringify(products, null, 2), 'utf8');
}

// 商品一覧取得
export async function GET() {
  try {
    const products = await readProductsFile();
    return NextResponse.json(products);
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json({ error: 'Failed to fetch products' }, { status: 500 });
  }
}

// 商品登録
export async function POST(request: Request) {
  try {
    const products = await readProductsFile();
    const body = await request.json();
    const newProduct: Product = {
      product_id: await getNextProductId(), // 新しいIDを生成
      ...body,
    };
    products.push(newProduct);
    await writeProductsFile(products);
    return NextResponse.json(newProduct, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}



