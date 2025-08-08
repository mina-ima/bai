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
  const regex = new RegExp(`^${prefix}(\d{9})$`); // Regex to match prefix + 9 digits
  for (const data of existingData) {
    const currentId = data[idField] as string;
    const match = currentId.match(regex);
    if (match) {
      const idNum = parseInt(match[1], 10);
      if (!isNaN(idNum) && idNum > maxIdNum) {
        maxIdNum = idNum;
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

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    let allData = await readData();

    // フィルタリングロジック
    allData = allData.filter(delivery => {
      // 納品ID
      const deliveryId = searchParams.get('delivery_id');
      if (deliveryId && !delivery.delivery_id.includes(deliveryId)) return false;

      // 納品品番
      const productName = searchParams.get('product_name');
      if (productName && !delivery.product_name.includes(productName)) return false;

      // 納品数量 (From/To)
      const quantityFrom = searchParams.get('quantity_from');
      const quantityTo = searchParams.get('quantity_to');
      if (quantityFrom && delivery.quantity < parseFloat(quantityFrom)) return false;
      if (quantityTo && delivery.quantity > parseFloat(quantityTo)) return false;

      // 納品単価 (From/To)
      const unitPriceFrom = searchParams.get('unit_price_from');
      const unitPriceTo = searchParams.get('unit_price_to');
      if (unitPriceFrom && delivery.unit_price < parseFloat(unitPriceFrom)) return false;
      if (unitPriceTo && delivery.unit_price > parseFloat(unitPriceTo)) return false;

      // 合計金額 (From/To)
      const totalAmountFrom = searchParams.get('total_amount_from');
      const totalAmountTo = searchParams.get('total_amount_to');
      if (totalAmountFrom && delivery.total_amount < parseFloat(totalAmountFrom)) return false;
      if (totalAmountTo && delivery.total_amount > parseFloat(totalAmountTo)) return false;

      // 納品備考
      const deliveryNote = searchParams.get('delivery_note');
      if (deliveryNote && !delivery.delivery_note.includes(deliveryNote)) return false;

      // 納品税区分
      const deliveryTax = searchParams.get('delivery_tax');
      if (deliveryTax && delivery.delivery_tax !== parseFloat(deliveryTax)) return false;

      // 注文番号
      const orderId = searchParams.get('delivery_orderId');
      if (orderId && !delivery.delivery_orderId.includes(orderId)) return false;

      // 売上グループ
      const salesGroup = searchParams.get('delivery_salesGroup');
      if (salesGroup && !delivery.delivery_salesGroup.includes(salesGroup)) return false;

      // 納品書番号
      const deliveryNumber = searchParams.get('delivery_number');
      if (deliveryNumber && !delivery.delivery_number.includes(deliveryNumber)) return false;

      // 請求書番号
      const invoiceNumber = searchParams.get('delivery_invoiceNumber');
      if (invoiceNumber && !delivery.delivery_invoiceNumber.includes(invoiceNumber)) return false;

      // 納品書ステータス
      const deliveryStatus = searchParams.get('delivery_status');
      if (deliveryStatus && delivery.delivery_status !== deliveryStatus) return false;

      // 請求書ステータス
      const invoiceStatus = searchParams.get('delivery_invoiceStatus');
      if (invoiceStatus && delivery.delivery_invoiceStatus !== invoiceStatus) return false;

      // 納品日 (From/To)
      const deliveryDateFromStr = searchParams.get('delivery_date_from');
      const deliveryDateToStr = searchParams.get('delivery_date_to');

      const normalizedDeliveryDate = normalizeDate(delivery.delivery_date);

      if (deliveryDateFromStr) {
        const filterDateFrom = normalizeDate(deliveryDateFromStr);
        if (isNaN(filterDateFrom.getTime()) || isNaN(normalizedDeliveryDate.getTime())) {
          console.warn(`Invalid delivery_date_from or delivery.delivery_date for delivery ID ${delivery.delivery_id}`);
        } else if (normalizedDeliveryDate < filterDateFrom) {
          return false;
        }
      }
      if (deliveryDateToStr) {
        const filterDateTo = normalizeDate(deliveryDateToStr);
        // filterDateTo を翌日の00:00:00に設定して、指定日全体を含むようにする
        filterDateTo.setDate(filterDateTo.getDate() + 1);
        if (isNaN(filterDateTo.getTime()) || isNaN(normalizedDeliveryDate.getTime())) {
          console.warn(`Invalid delivery_date_to or delivery.delivery_date for delivery ID ${delivery.delivery_id}`);
        } else if (normalizedDeliveryDate >= filterDateTo) {
          return false;
        }
      }

      // 請求日 (From/To)
      const invoiceDateFromStr = searchParams.get('delivery_invoiceDate_from');
      const invoiceDateToStr = searchParams.get('delivery_invoiceDate_to');

      const normalizedDeliveryInvoiceDate = normalizeDate(delivery.delivery_invoiceDate);

      if (invoiceDateFromStr) {
        const filterInvoiceDateFrom = normalizeDate(invoiceDateFromStr);
        if (isNaN(filterInvoiceDateFrom.getTime()) || isNaN(normalizedDeliveryInvoiceDate.getTime())) {
          console.warn(`Invalid invoiceDateFrom or delivery.delivery_invoiceDate for delivery ID ${delivery.delivery_id}`);
        } else if (normalizedDeliveryInvoiceDate < filterInvoiceDateFrom) {
          return false;
        }
      }
      if (invoiceDateToStr) {
        const filterInvoiceDateTo = normalizeDate(invoiceDateToStr);
        // filterInvoiceDateTo を翌日の00:00:00に設定して、指定日全体を含むようにする
        filterInvoiceDateTo.setDate(filterInvoiceDateTo.getDate() + 1);
        if (isNaN(filterInvoiceDateTo.getTime()) || isNaN(normalizedDeliveryInvoiceDate.getTime())) {
          console.warn(`Invalid invoiceDateTo or delivery.delivery_invoiceDate for delivery ID ${delivery.delivery_id}`);
        } else if (normalizedDeliveryInvoiceDate >= filterInvoiceDateTo) {
          return false;
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
    // If delivery_number is empty, generate a new one
    if (!updatedData.delivery_number) {
      updatedData.delivery_number = generateNextId('DN', allData, 'delivery_number');
    }
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
