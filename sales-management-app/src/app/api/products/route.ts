import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types/product';
import { v4 as uuidv4 } from 'uuid';

const PRODUCT_LIST_PATH = path.join(process.cwd(), 'sales-management-app', 'data', 'product_list.json');

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
      product_id: uuidv4(),
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

// 商品削除 (DELETEメソッドの追加)
export async function DELETE(request: Request) {
  try {
    const url = new URL(request.url);
    const productId = url.pathname.split('/').pop(); // URLからIDを取得

    if (!productId) {
      return NextResponse.json({ error: 'Product ID is required' }, { status: 400 });
    }

    let products = await readProductsFile();
    const initialLength = products.length;
    products = products.filter(product => product.product_id !== productId);

    if (products.length === initialLength) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404 });
    }

    await writeProductsFile(products);
    return NextResponse.json({ message: 'Product deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting product:', error);
    return NextResponse.json({ error: 'Failed to delete product' }, { status: 500 });
  }
}

