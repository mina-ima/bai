import { NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { Delivery } from '@/types/delivery';

const dataFilePath = path.join(process.cwd(), 'public', 'data', 'delivery_list.json');

async function readData(): Promise<Delivery[]> {
  try {
    const data = await fs.readFile(dataFilePath, 'utf-8');
    return JSON.parse(data).map((delivery: Delivery) => ({
      ...delivery,
      total_amount: typeof delivery.total_amount === 'string' && delivery.total_amount === '' ? 0 : Number(delivery.total_amount),
      quantity: Number(delivery.quantity),
      unit_price: Number(delivery.unit_price),
      delivery_tax: Number(delivery.delivery_tax),
    }));
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    console.error('readData: Error reading data:', error);
    throw error;
  }
}

async function writeData(data: Delivery[]): Promise<void> {
  await fs.writeFile(dataFilePath, JSON.stringify(data, null, 2));
}

// Helper function to normalize a date string to the start of the day
const normalizeDate = (dateString: string) => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0); // Set to beginning of the day
  return date;
};

function generateNextId(prefix: string, existingData: Delivery[], idField: keyof Delivery): string {
  let maxIdNum = 0;
  const regex = new RegExp(`^${prefix}(\d+)$`); // Regex to match prefix + any digits
  for (const data of existingData) {
    const currentId = data[idField] as string;
    // Check if currentId exists before trying to match
    if (currentId) {
      const match = currentId.match(regex);
      if (match) {
        const idNum = parseInt(match[1], 10);
        if (!isNaN(idNum) && idNum > maxIdNum) {
          maxIdNum = idNum;
        }
      }
    }
  }
  const nextIdNum = maxIdNum + 1;
  const paddedId = String(nextIdNum).padStart(9, '0');
  const newId = prefix + paddedId;
  return newId;
}

export async function POST(request: Request) {
  try {
    const newData: Delivery = await request.json();
    const allData = await readData();
    // Set the delivery ID with 'D' prefix
    newData.delivery_id = generateNextId('D', allData, 'delivery_id');
    allData.push(newData);
    await writeData(allData);
    return NextResponse.json(newData, { status: 201 });
  } catch (error: any) {
    console.error('Error writing data:', error);
    return NextResponse.json({ message: 'Error writing data' }, { status: 500 });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let allData = await readData();

    // Filtering logic
    allData = allData.filter(delivery => {
      // Delivery ID
      const deliveryId = searchParams.get('delivery_id');
      if (deliveryId && !delivery.delivery_id.includes(deliveryId)) return false;

      // Product Name
      const productName = searchParams.get('product_name');
      if (productName && !delivery.product_name.includes(productName)) return false;

      // Quantity (From/To)
      const quantityFrom = searchParams.get('quantity_from');
      const quantityTo = searchParams.get('quantity_to');
      if (quantityFrom && delivery.quantity < parseFloat(quantityFrom)) return false;
      if (quantityTo && delivery.quantity > parseFloat(quantityTo)) return false;

      // Unit Price (From/To)
      const unitPriceFrom = searchParams.get('unit_price_from');
      const unitPriceTo = searchParams.get('unit_price_to');
      if (unitPriceFrom && delivery.unit_price < parseFloat(unitPriceFrom)) return false;
      if (unitPriceTo && delivery.unit_price > parseFloat(unitPriceTo)) return false;

      // Total Amount (From/To)
      const totalAmountFrom = searchParams.get('total_amount_from');
      const totalAmountTo = searchParams.get('total_amount_to');
      if (totalAmountFrom && delivery.total_amount < parseFloat(totalAmountFrom)) return false;
      if (totalAmountTo && delivery.total_amount > parseFloat(totalAmountTo)) return false;

      // Delivery Note
      const deliveryNote = searchParams.get('delivery_note');
      if (deliveryNote && !delivery.delivery_note.includes(deliveryNote)) return false;

      // Delivery Tax
      const deliveryTax = searchParams.get('delivery_tax');
      if (deliveryTax && delivery.delivery_tax !== parseFloat(deliveryTax)) return false;

      // Order ID
      const orderId = searchParams.get('delivery_orderId');
      if (orderId && !delivery.delivery_orderId.includes(orderId)) return false;

      // Sales Group
      const salesGroup = searchParams.get('delivery_salesGroup');
      if (salesGroup && !delivery.delivery_salesGroup.includes(salesGroup)) return false;

      // Delivery Number
      const deliveryNumber = searchParams.get('delivery_number');
      if (deliveryNumber && delivery.delivery_number && !delivery.delivery_number.includes(deliveryNumber)) return false;

      // Invoice Number
      const invoiceNumber = searchParams.get('delivery_invoiceNumber');
      if (invoiceNumber && delivery.invoice_number && !delivery.invoice_number.includes(invoiceNumber)) return false;

      // Delivery Status
      const deliveryStatus = searchParams.get('delivery_status');
      if (deliveryStatus && delivery.delivery_status !== deliveryStatus) return false;

      // Invoice Status
      const invoiceStatus = searchParams.get('delivery_invoiceStatus');
      if (invoiceStatus && delivery.invoice_invoiceStatus !== invoiceStatus) return false;

      // Delivery Date (From/To)
      const deliveryDateFromStr = searchParams.get('delivery_date_from');
      const deliveryDateToStr = searchParams.get('delivery_date_to');
      if (delivery.delivery_date) {
        const normalizedDeliveryDate = normalizeDate(delivery.delivery_date);
        if (deliveryDateFromStr) {
          const filterDateFrom = normalizeDate(deliveryDateFromStr);
          if (normalizedDeliveryDate < filterDateFrom) return false;
        }
        if (deliveryDateToStr) {
          const filterDateTo = normalizeDate(deliveryDateToStr);
          filterDateTo.setDate(filterDateTo.getDate() + 1);
          if (normalizedDeliveryDate >= filterDateTo) return false;
        }
      }

      // Invoice Date (From/To)
      const invoiceDateFromStr = searchParams.get('delivery_invoiceDate_from');
      const invoiceDateToStr = searchParams.get('delivery_invoiceDate_to');
      if (delivery.delivery_invoiceDate) {
        const normalizedDeliveryInvoiceDate = normalizeDate(delivery.delivery_invoiceDate);
        if (invoiceDateFromStr) {
          const filterInvoiceDateFrom = normalizeDate(invoiceDateFromStr);
          if (normalizedDeliveryInvoiceDate < filterInvoiceDateFrom) return false;
        }
        if (invoiceDateToStr) {
          const filterInvoiceDateTo = normalizeDate(invoiceDateToStr);
          filterInvoiceDateTo.setDate(filterInvoiceDateTo.getDate() + 1);
          if (normalizedDeliveryInvoiceDate >= filterInvoiceDateTo) return false;
        }
      }

      return true;
    });

    return NextResponse.json(allData);
  } catch (error: any) {
    console.error('Error reading data:', error);
    return NextResponse.json({ message: 'Error reading data' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json();
    const allData = await readData();

    // Case 1: Bulk operations based on delivery_ids array
    if (body.delivery_ids && Array.isArray(body.delivery_ids)) {
      const { delivery_ids, issue_individually } = body;
      if (delivery_ids.length === 0) {
        return NextResponse.json({ message: 'delivery_ids array cannot be empty' }, { status: 400 });
      }

      const updatedRecords: Delivery[] = [];

      if (issue_individually === true) {
        // INDIVIDUAL ISSUANCE: Generate unique numbers sequentially.
        let maxIdNum = 0;
        const regex = new RegExp(`^DS(\d+)`);
        for (const data of allData) {
          const currentId = data.delivery_number as string;
          if (currentId) {
            const match = currentId.match(regex);
            if (match) {
              const idNum = parseInt(match[1], 10);
              if (!isNaN(idNum) && idNum > maxIdNum) {
                maxIdNum = idNum;
              }
            }
          }
        }
        let nextIdCounter = maxIdNum + 1;

        delivery_ids.forEach((id: string) => {
          const index = allData.findIndex(delivery => delivery.delivery_id === id);
          if (index !== -1) {
            const paddedId = String(nextIdCounter).padStart(9, '0');
            const newDeliveryNumber = 'DS' + paddedId;
            allData[index].delivery_number = newDeliveryNumber;
            allData[index].delivery_status = '済';
            updatedRecords.push(allData[index]);
            nextIdCounter++;
          }
        });

      } else {
        // CONSOLIDATED ISSUANCE: Generate a single 'DN' number and assign it to all.
        const newDeliveryNumber = generateNextId('DN', allData, 'delivery_number');
        delivery_ids.forEach((id: string) => {
          const index = allData.findIndex(delivery => delivery.delivery_id === id);
          if (index !== -1) {
            allData[index].delivery_number = newDeliveryNumber;
            allData[index].delivery_status = '済';
            updatedRecords.push(allData[index]);
          }
        });
      }

      if (updatedRecords.length === 0) {
        return NextResponse.json({ message: 'None of the provided delivery_ids were found' }, { status: 404 });
      }

      await writeData(allData);
      return NextResponse.json({
        message: 'Delivery numbers issued successfully',
        updated_records: updatedRecords,
      }, { status: 200 });

    } else { // Case 2: Simple single record update (from form save)
      const { searchParams } = new URL(request.url);
      const deliveryId = searchParams.get('delivery_id');
      const updatedData: Delivery = body;

      if (!deliveryId) {
        return NextResponse.json({ message: 'delivery_id is required for single update' }, { status: 400 });
      }

      const index = allData.findIndex(delivery => delivery.delivery_id === deliveryId);

      if (index === -1) {
        return NextResponse.json({ message: 'Delivery not found' }, { status: 404 });
      }

      allData[index] = { ...allData[index], ...updatedData, delivery_id: deliveryId };

      await writeData(allData);
      return NextResponse.json(allData[index], { status: 200 });
    }
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
