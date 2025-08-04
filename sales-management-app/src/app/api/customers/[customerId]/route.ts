import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Customer } from '@/types/customer';

const customersFilePath = path.join(process.cwd(), 'data', 'customer_list.json');

export async function PUT(req: NextRequest, { params }: { params: { customerId: string } }) {
  const customerId = params.customerId;
  let updatedCustomerData: Partial<Customer>;
  try {
    updatedCustomerData = await req.json();
  } catch (jsonError) {
    console.error('Error parsing request JSON:', jsonError);
    return NextResponse.json({ message: 'Invalid JSON in request body.' }, { status: 400 });
  }

  let customers: Customer[] = [];
  try {
    const customersData = await fs.readFile(customersFilePath, 'utf-8');
    customers = JSON.parse(customersData);
  } catch (fileReadError: any) {
    if (fileReadError.code === 'ENOENT') {
      console.warn(`Customer list file not found at ${customersFilePath}. Returning 404.`);
      return NextResponse.json({ message: 'Customer list file not found.' }, { status: 404 });
    }
    console.error('Error reading or parsing customer list file:', fileReadError);
    return NextResponse.json({ message: 'Failed to read customer data.' }, { status: 500 });
  }

  const customerIndex = customers.findIndex(c => c.customer_id === customerId);

  if (customerIndex === -1) {
    console.warn(`Customer with ID ${customerId} not found for update.`);
    return NextResponse.json({ message: 'Customer not found.' }, { status: 404 });
  }

  try {
    customers[customerIndex] = { ...customers[customerIndex], ...updatedCustomerData };

    await fs.writeFile(customersFilePath, JSON.stringify(customers, null, 2), 'utf-8');

    return NextResponse.json({ message: 'Customer updated successfully.', customer: customers[customerIndex] }, { status: 200 });
  } catch (updateError) {
    console.error('Error during customer update process (write file or data manipulation):', updateError);
    return NextResponse.json({ message: 'Internal Server Error during update.' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { customerId: string } }) {
  try {
    const customerId = params.customerId;
    const customersData = await fs.readFile(customersFilePath, 'utf-8');
    let customers = JSON.parse(customersData);
    const initialLength = customers.length;
    customers = customers.filter((customer: any) => customer.customer_id !== customerId);

    if (customers.length === initialLength) {
      return NextResponse.json({ message: 'Customer not found' }, { status: 404 });
    }

    await fs.writeFile(customersFilePath, JSON.stringify(customers, null, 2), 'utf-8');
    return NextResponse.json({ message: 'Customer deleted successfully' }, { status: 200 });
  } catch (error) {
    console.error('Error deleting customer:', error);
    return NextResponse.json({ message: 'Internal Server Error' }, { status: 500 });
  }
}
