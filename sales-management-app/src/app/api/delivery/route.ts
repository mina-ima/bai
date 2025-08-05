import { NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';
import { Delivery } from '@/types/delivery';

const dataFilePath = path.join(process.cwd(), 'data', 'delivery_list.json');

async function readData(): Promise<Delivery[]> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }
}

async function writeData(data: Delivery[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

function generateNextId(prefix: string, existingData: Delivery[], idField: keyof Delivery): string {
  let maxSequentialId = 0;
  const regex = new RegExp(`^${prefix}(\d{9})$`); // Regex to match prefix + 9 digits
  for (const data of existingData) {
    const currentId = data[idField] as string;
    const match = currentId.match(regex);
    if (match) {
      const idNum = parseInt(match[1], 10); // Extract the 9-digit number
      if (!isNaN(idNum) && idNum > maxSequentialId) {
        maxSequentialId = idNum;
      }
    }
  }
  const nextId = maxSequentialId + 1;
  const paddedId = String(nextId).padStart(9, '0');
  return `${prefix}${paddedId}`;
}

export async function POST(request: Request) {
  try {
    const newData: Delivery = await request.json();
    const allData = await readData();
    // 自動付番の項目を設定
    newData.delivery_id = generateNextId('del-', allData, 'delivery_id');
    newData.delivery_number = generateNextId('DN-', allData, 'delivery_number');
    newData.delivery_invoiceNumber = generateNextId('IN-', allData, 'delivery_invoiceNumber');
    allData.push(newData);
    await writeData(allData);
    return NextResponse.json(newData, { status: 201 });
  } catch (error: any) {
    console.error('Error writing data:', error);
    return NextResponse.json({ message: 'Error writing data' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const allData = await readData();
    return NextResponse.json(allData);
  } catch (error: any) {
    console.error('Error reading data:', error);
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deliveryId = searchParams.get('delivery_id');

    if (!deliveryId) {
      return NextResponse.json({ message: 'delivery_id is required' }, { status: 400 });
    }

    let allData = await readData();
    const initialLength = allData.length;
    allData = allData.filter(delivery => delivery.delivery_id !== deliveryId);

    if (allData.length === initialLength) {
      return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
    }

    await writeData(allData);
    return NextResponse.json({ message: 'Delivery deleted successfully' }, { status: 200 });
  } catch (error: any) {
    console.error('Error deleting data:', error);
    return NextResponse.json({ message: 'Error deleting data' }, { status: 500 });
  }
}
