import { NextResponse } from 'next/server';
import Papa from 'papaparse';
import fs from 'fs';
import path from 'path';

// Helper function to add BOM to a string
const addBom = (data: string) => {
  return '\uFEFF' + data;
};

// Helper function to read JSON data
const readJsonData = async (filename: string) => {
  const filePath = path.join(process.cwd(), 'public', 'data', filename);
  const fileContents = await fs.promises.readFile(filePath, 'utf8');
  return JSON.parse(fileContents);
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const dataType = searchParams.get('type');

  let data: any[] = [];
  let filename = '';

  try {
    switch (dataType) {
      case 'company_info':
        data = [await readJsonData('company_info.json')]; // Company info is a single object
        filename = 'company_info.csv';
        break;
      case 'customer_list':
        data = await readJsonData('customer_list.json');
        filename = 'customer_list.csv';
        break;
      case 'product_list':
        data = await readJsonData('product_list.json');
        filename = 'product_list.csv';
        break;
      case 'user_list':
        data = await readJsonData('user_list.json');
        filename = 'user_list.csv';
        break;
      case 'delivery_list':
        data = await readJsonData('delivery_list.json');
        filename = 'delivery_list.csv';
        break;
      default:
        return new NextResponse('Invalid data type', { status: 400 });
    }

    const csv = Papa.unparse(data, {
      header: true,
      skipEmptyLines: true,
    });

    const csvWithBom = addBom(csv);

    return new NextResponse(csvWithBom, {
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error) {
    console.error('Error generating CSV:', error);
    return new NextResponse('Error generating CSV', { status: 500 });
  }
}
