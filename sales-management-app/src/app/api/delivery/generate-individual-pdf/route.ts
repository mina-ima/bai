// This API route is dedicated to generating a single individual delivery note.
// It receives a single delivery item and generates a PDF document for it.
// This separation ensures that changes to individual generation logic do not affect bulk delivery note generation.

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
      // 必要であれば、boldなどのフォントも追加
    ],
  });
  console.log('Font NotoSansJP registered successfully with font-face format.');
} catch (error) {
  console.error('Failed to register font at module level:', error);
  throw new Error('Failed to load font for PDF generation at module level.');
}

export async function POST(req: NextRequest) {
  try {
    // Expecting a single delivery object, company info, and customer info
    const { delivery, companyInfo, customer, delivery_number, delivery_date } = await req.json();
    console.log('API: Received companyInfo:', JSON.stringify(companyInfo, null, 2));

    // Validate incoming data for individual generation
    if (!delivery) {
      return NextResponse.json({ message: 'No delivery data provided for individual generation' }, { status: 400 });
    }
    if (!companyInfo) {
      return NextResponse.json({ message: 'Company info not provided' }, { status: 400 });
    }
    if (!customer) {
      return NextResponse.json({ message: 'Customer info not provided' }, { status: 400 });
    }

    const pdfData: DeliveryNotePdfProps = {
      deliveryNoteNumber: delivery.delivery_number || delivery_number || '未設定',
      deliveryDate: delivery.delivery_date || delivery_date,
      companyInfo: companyInfo,
      deliveryItems: [{
        productCode: delivery.product_name,
        quantity: delivery.quantity,
        unit: delivery.delivery_unit,
        unitPrice: delivery.unit_price,
        remarks: delivery.delivery_note,
      }],
      currentPage: 1,
      totalPages: 1,
      customerInfo: {
        code: customer.customer_id,
        postalCode: customer.customer_postalCode,
        address: customer.customer_address,
        name: customer.customer_formalName,
      },
    };

    console.log('Debug: pdfData.companyInfo before rendering:', JSON.stringify(pdfData.companyInfo, null, 2));
    // Render the PDF page using @react-pdf/renderer
    const pdfStream = await renderToStream(
      React.createElement(Document, null,
        React.createElement(Page, { size: "A4", style: styles.page },
          React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: true } }), // Render for copy
          React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: false } }) // Render for original
        )
      )
    );
    // Convert the PDF stream to bytes
    const pdfBytes = await new Promise<Uint8Array>((resolve, reject) => {
      const chunks: Buffer[] = [];
      pdfStream.on('data', (chunk) => chunks.push(chunk));
      pdfStream.on('end', () => {
        resolve(Buffer.concat(chunks));
      });
      pdfStream.on('error', (err) => {
        console.error('Error during PDF stream:', err);
        reject(err);
      });
    });

    const buffer = Buffer.from(pdfBytes);

    // Set response headers for PDF download
    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename*=UTF-8''${encodeURIComponent(`納品書_${delivery.delivery_number || '未設定'}.pdf`)}`,
    });

    return new NextResponse(buffer, { headers });

  } catch (error) {
    console.error('Error generating individual PDF:', error);
    return NextResponse.json({ message: 'Error generating individual PDF' }, { status: 500 });
  }
}
