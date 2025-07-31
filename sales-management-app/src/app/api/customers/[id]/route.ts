import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

const customersFilePath = path.join(process.cwd(), 'data', 'customer_list.json');

export async function DELETE(req: NextRequest, { params }: any) {
  try {
    const { id } = params;
    const customersData = fs.readFileSync(customersFilePath, 'utf-8');
    let customers = JSON.parse(customersData);
    const initialLength = customers.length;
    customers = customers.filter((customer: any) => customer.customer_id !== id);

    if (customers.length === initialLength) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    fs.writeFileSync(customersFilePath, JSON.stringify(customers, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Customer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}