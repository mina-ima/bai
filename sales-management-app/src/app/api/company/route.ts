import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

// DATA_FILE_PATH のパスを修正
const DATA_FILE_PATH = path.join(process.cwd(), 'public', 'data', 'company_info.json');

// Helper function to read company info from file
async function readCompanyInfo() {
  try {
    const data = await fs.readFile(DATA_FILE_PATH, 'utf8');
    return JSON.parse(data);
  } catch (error: any) {
    if (error.code === 'ENOENT') {
      // File not found, return empty object
      return {};
    }
    throw error;
  }
}

// Helper function to write company info to file
async function writeCompanyInfo(data: any) {
  await fs.mkdir(path.dirname(DATA_FILE_PATH), { recursive: true });
  await fs.writeFile(DATA_FILE_PATH, JSON.stringify(data, null, 2), 'utf8');
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    console.log('Received company info for saving:', body);

    await writeCompanyInfo(body);

    console.log('Company info saved successfully to file.');
    return NextResponse.json({ message: 'Company info saved successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error saving company info to file:', error);
    return NextResponse.json({ error: 'Error saving company info' }, { status: 500 });
  }
}

export async function GET() {
  try {
    const companyInfo = await readCompanyInfo();
    console.log('Company info fetched from file:', companyInfo);

    if (Object.keys(companyInfo).length > 0) {
      return NextResponse.json(companyInfo, { status: 200 });
    } else {
      return NextResponse.json({ message: 'Company info not found' }, { status: 404 });
    }
  } catch (error) {
    console.error('Error fetching company info from file:', error);
    return NextResponse.json({ error: 'Error fetching company info' }, { status: 500 });
  }
}