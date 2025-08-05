import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types/product';

const productsFilePath = path.join(process.cwd(), 'data', 'product_list.json');

export async function PUT(req: NextRequest, { params }: { params: Promise<{ productId: string }> }) {
  const { productId } = await params;
  let updatedProductData: Partial<Product>;
  try {
    updatedProductData = await req.json();
  } catch (jsonError) {
    console.error('Error parsing request JSON:', jsonError);
    return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
  }

  let products: Product[] = [];
  try {
    const productsData = await fs.readFile(productsFilePath, 'utf-8');
    products = JSON.parse(productsData);
  } catch (fileReadError: any) {
    if (fileReadError.code === 'ENOENT') {
      console.warn(`Product list file not found at ${productsFilePath}. Returning 404.`);
      return NextResponse.json({ message: 'Product list file not found.' }, { status: 404 });
    }
    console.error('Error reading or parsing product list file:', fileReadError);
    return NextResponse.json({ message: 'Failed to read product data.' }, { status: 500 });
  }

  const productIndex = products.findIndex(p => p.product_id === productId);

  if (productIndex === -1) {
    console.warn(`Product with ID ${productId} not found for update.`);
    return NextResponse.json({ message: 'Product not found.' }, { status: 404 });
  }

  try {
    products[productIndex] = { ...products[productIndex], ...updatedProductData };

    await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Product updated successfully.', product: products[productIndex] }, { status: 200 });
  } catch (updateError) {
    console.error('Error during product update process (write file or data manipulation):', updateError);
    return NextResponse.json({ message: 'Internal Server Error during update.' }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ productId: string }> }) {
  try {
    const { productId } = await params;

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

async function readProductsFile(): Promise<Product[]> {
  try {
    const data = await fs.readFile(productsFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeProductsFile(products: Product[]): Promise<void> {
  await fs.writeFile(productsFilePath, JSON.stringify(products, null, 2), 'utf8');
}
