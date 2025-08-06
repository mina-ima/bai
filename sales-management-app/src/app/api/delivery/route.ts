import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Delivery } from '@/types/delivery';

const dataFilePath = path.join(process.cwd(), 'public', 'data', 'delivery_list.json');

async function readData(): Promise<Delivery[]> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    console.log('readData: File content read successfully.');
    return JSON.parse(data);
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      console.log('readData: File not found, returning empty array.');
      return [];
    }
    console.error('readData: Error reading data:', error);
    throw error;
  }
}

async function writeData(data: Delivery[]): Promise<void> {
  console.log('writeData: Writing data to file:', JSON.stringify(data, null, 2));
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
  console.log('writeData: Data written successfully.');
}

function generateNextId(prefix: string, existingData: Delivery[], idField: keyof Delivery): string {
  console.log('generateNextId: existingData received:', existingData.map(d => d[idField]));
  let maxIdNum = 0;
  const regex = new RegExp(`^${prefix}(\\d{9})$`); // Regex to match prefix + 9 digits
  for (const data of existingData) {
    const currentId = data[idField] as string;
    console.log(`generateNextId: Processing ID: ${currentId}`); // Added log
    const match = currentId.match(regex);
    console.log(`generateNextId: Regex match result for ${currentId}:`, match); // Added log
    if (match) {
      const idNum = parseInt(match[1], 10);
      console.log(`generateNextId: Parsed idNum for ${currentId}:`, idNum); // Added log
      if (!isNaN(idNum) && idNum > maxIdNum) {
        maxIdNum = idNum;
      }
    }
  }
  const nextIdNum = maxIdNum + 1;
  const paddedId = String(nextIdNum).padStart(9, '0');
  const newId = prefix + paddedId;
  console.log('generateNextId: Generated new ID:', newId, 'from maxIdNum:', maxIdNum);
  return newId;
}

export async function POST(request: Request) {
  try {
    const newData: Delivery = await request.json();
    const allData = await readData();
    // 自動付番の項目を設定
    newData.delivery_id = generateNextId('D', allData, 'delivery_id');
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

export async function PUT(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const deliveryId = searchParams.get('delivery_id');
    const updatedData: Delivery = await request.json();

    if (!deliveryId) {
      return NextResponse.json({ message: 'delivery_id is required' }, { status: 400 });
    }

    const allData = await readData();
    const index = allData.findIndex(delivery => delivery.delivery_id === deliveryId);

    if (index === -1) {
      return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
    }

    // Update the existing delivery with new data, but keep the original delivery_id
    allData[index] = { ...allData[index], ...updatedData, delivery_id: deliveryId };

    await writeData(allData);
    return NextResponse.json(allData[index], { status: 200 });
  } catch (error: any) {
    console.error('Error updating data:', error);
    return NextResponse.json({ message: 'Error updating data' }, { status: 500 });
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
