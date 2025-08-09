import { NextRequest, NextResponse } from 'next/server';
import { renderToStream, Font, Document, Page } from '@react-pdf/renderer';
import React from 'react';
import { PDFDocument } from 'pdf-lib';
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
        const { deliveries, companyInfo, customers, delivery_number, delivery_date } = await req.json();
    console.log('API: Received companyInfo:', JSON.stringify(companyInfo, null, 2));

    if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
      return NextResponse.json({ message: 'No delivery data provided' }, { status: 400 });
    }
    if (!companyInfo) {
      return NextResponse.json({ message: 'Company info not provided' }, { status: 400 });
    }
    if (!customers || customers.length === 0) {
      return NextResponse.json({ message: 'Customer info not provided' }, { status: 400 });
    }

    const representativeCustomer = customers[0];
    console.log('--- Debug: API representativeCustomer ---');
    console.log(representativeCustomer);

    const combinedPdf = await PDFDocument.create();
    const itemsPerPage = 10;

    for (let i = 0; i < deliveries.length; i += itemsPerPage) {
      const chunk = deliveries.slice(i, i + itemsPerPage);
      const currentPage = Math.floor(i / itemsPerPage) + 1;
      const totalPages = Math.ceil(deliveries.length / itemsPerPage);

      const pdfData: DeliveryNotePdfProps = {
        deliveryNoteNumber: chunk[0].delivery_number || delivery_number || '未設定',
        deliveryDate: chunk[0].delivery_date,
        companyInfo: companyInfo,
        deliveryItems: chunk.map((item: any) => ({
          productCode: item.productCode,
          quantity: item.quantity,
          unit: item.unit,
          unitPrice: item.unitPrice,
          remarks: item.remarks,
        })),
        currentPage: currentPage,
        totalPages: totalPages,
        customerInfo: representativeCustomer ? {
          code: representativeCustomer.customer_id,
          postalCode: representativeCustomer.customer_postalCode,
          address: representativeCustomer.customer_address,
          name: representativeCustomer.customer_formalName,
        } : {
          code: '',
          postalCode: '',
          address: '',
          name: '',
        },
      };

      console.log('Debug: pdfData.companyInfo before rendering:', JSON.stringify(pdfData.companyInfo, null, 2));
      const pdfStream = await renderToStream(
        React.createElement(Document, null,
          React.createElement(Page, { size: "A4", style: styles.page },
            React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: true } }),
            React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: false } })
          )
        )
      );
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

      const pdfDoc = await PDFDocument.load(pdfBytes);
      const copiedPages = await combinedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => combinedPdf.addPage(page));
    }

    const finalPdfBytes = await combinedPdf.save();

    const buffer = Buffer.from(finalPdfBytes);

    const headers = new Headers({
      'Content-Type': 'application/pdf',
      'Content-Disposition': 'attachment; filename="delivery_notes.pdf"',
    });

    return new NextResponse(buffer, { headers });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return NextResponse.json({ message: 'Error generating PDF' }, { status: 500 });
  }
}
