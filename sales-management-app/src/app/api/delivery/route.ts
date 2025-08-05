
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

export async function POST(request: Request) {
  try {
    const newData = await request.json();
    const allData = await readData();
    newData.delivery_id = `del-${Date.now()}`;
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
