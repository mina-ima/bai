import { NextRequest, NextResponse } from 'next/server';
import { renderToStream, Font, Document, Page } from '@react-pdf/renderer';
import React from 'react';
import { DeliveryNotePdfProps, DeliveryNoteContent, styles } from '@/components/DeliveryNotePdf';
import path from 'path';
import { readFileSync, existsSync } from 'fs';
import { Buffer } from 'buffer';

const fontPath = path.join(process.cwd(), 'public', 'fonts', 'ipaexg.ttf');

// Register font once when the module is loaded
try {
  if (!existsSync(fontPath)) {
    console.error(`Font file does not exist at: ${fontPath}`);
    throw new Error('Font file not found.');
  }
  const fontBuffer = readFileSync(fontPath);
  Font.register({
    family: 'NotoSansJP',
    fonts: [
      { src: fontPath, fontWeight: 'normal' },
    ],
  });
  console.log('Font NotoSansJP registered successfully with font-face format.');
} catch (error) {
  console.error('Failed to register font at module level:', error);
  throw new Error('Failed to load font for PDF generation at module level.');
}

export async function POST(req: NextRequest) {
  try {
    const { deliveries, companyInfo, customers, delivery_number, delivery_date } = await req.json();

    // Validate incoming data
    if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
      return NextResponse.json({ message: 'No delivery data provided for bulk generation' }, { status: 400 });
    }
    if (!companyInfo) {
      return NextResponse.json({ message: 'Company info not provided' }, { status: 400 });
    }
    if (!customers || !Array.isArray(customers) || customers.length === 0) {
      return NextResponse.json({ message: 'Customer info not provided' }, { status: 400 });
    }

    const representativeCustomer = customers[0];
    const itemsPerPage = 10;
    const totalPages = Math.ceil(deliveries.length / itemsPerPage);

    // Create the PDF document component using React.createElement to avoid JSX issues in .ts files.
    const pdfComponent = React.createElement(
      Document,
      null,
      ...Array.from({ length: totalPages }).map((_, pageIndex) => {
        const startIndex = pageIndex * itemsPerPage;
        const endIndex = startIndex + itemsPerPage;
        const chunk = deliveries.slice(startIndex, endIndex);

        const pdfData: DeliveryNotePdfProps = {
          deliveryNoteNumber: delivery_number || '未設定',
          deliveryDate: delivery_date,
          companyInfo: companyInfo,
          deliveryItems: chunk.map((item: any) => ({
            productCode: item.productCode,
            quantity: item.quantity,
            unit: item.unit,
            unitPrice: item.unitPrice,
            remarks: item.remarks,
          })),
          currentPage: pageIndex + 1,
          totalPages: totalPages,
          customerInfo: {
            code: representativeCustomer.customer_id,
            postalCode: representativeCustomer.customer_postalCode,
            address: representativeCustomer.customer_address,
            name: representativeCustomer.customer_formalName,
          },
        };

        // Each page contains an original and a copy
        return React.createElement(
          Page,
          { key: pageIndex, size: 'A4', style: styles.page },
          React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: true } }),
          React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: false } })
        );
      })
    );

    // Render the PDF to a stream
    const stream = await renderToStream(pdfComponent);

    // Convert the stream to a buffer in a stable manner
    const pdfBytes = await new Promise<Uint8Array>((resolve, reject) => {
      const chunks: Buffer[] = [];
      stream.on('data', (chunk) => chunks.push(chunk));
      stream.on('end', () => resolve(Buffer.concat(chunks)));
      stream.on('error', (err) => reject(err));
    });

    // Set response headers for PDF download
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(`納品書_${delivery_number || '未設定'}.pdf`)}`,
    });

    return new NextResponse(pdfBytes, { headers });

  } catch (error) {
    console.error('Error generating bulk PDF:', error);
    return NextResponse.json({ message: 'Error generating bulk PDF' }, { status: 500 });
  }
}
