import { promises as fs } from 'fs';
import path from 'path';
import { Product } from '@/types/product';

const PRODUCT_LIST_PATH = path.join(process.cwd(), 'data', 'product_list.json');

export async function getNextProductId(): Promise<string> {
  let products: Product[] = [];
  try {
    const data = await fs.readFile(PRODUCT_LIST_PATH, 'utf8');
    products = JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // ファイルが存在しない場合は空のリストとして扱う
      products = [];
    } else {
      throw error;
    }
  }

  let maxIdNum = 0;
  products.forEach(product => {
    const idMatch = product.product_id.match(/^P(\d{8})$/);
    if (idMatch) {
      const idNum = parseInt(idMatch[1], 10);
      if (!isNaN(idNum) && idNum > maxIdNum) {
        maxIdNum = idNum;
      }
    }
  });

  const nextIdNum = maxIdNum + 1;
  // 8桁のゼロ埋め
  const nextId = `P${String(nextIdNum).padStart(8, '0')}`;
  return nextId;
}
