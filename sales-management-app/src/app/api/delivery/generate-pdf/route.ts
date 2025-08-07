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
  console.log(`Attempting to register font from: ${fontPath}`);
  if (!existsSync(fontPath)) {
    console.error(`Font file does not exist at: ${fontPath}`);
    throw new Error('Font file not found.');
  }
  const fontBuffer = readFileSync(fontPath);
  console.log(`Font buffer size: ${fontBuffer.length} bytes. Type of fontBuffer: ${typeof fontBuffer}`);
  Font.register({ family: 'NotoSansJP', src: fontPath });
  console.log('Font registered successfully at module level with Buffer data.');
} catch (error) {
  console.error('Failed to register font at module level:', error);
  throw new Error('Failed to load font for PDF generation at module level.');
}

export async function POST(req: NextRequest) {
  try {
        const { deliveries, companyInfo, customers, delivery_number, delivery_date } = await req.json();

    if (!deliveries || !Array.isArray(deliveries) || deliveries.length === 0) {
      console.error('Validation Error: No delivery data provided or invalid format.');
      return NextResponse.json({ message: 'No delivery data provided' }, { status: 400 });
    }
    if (!companyInfo) {
      console.error('Validation Error: Company info not provided in request.');
      return NextResponse.json({ message: 'Company info not provided' }, { status: 400 });
    }

    const combinedPdf = await PDFDocument.create();
    const itemsPerPage = 10;

    for (let i = 0; i < deliveries.length; i += itemsPerPage) {
      const chunk = deliveries.slice(i, i + itemsPerPage);
      const currentPage = Math.floor(i / itemsPerPage) + 1;
      const totalPages = Math.ceil(deliveries.length / itemsPerPage);

      const representativeCustomer = customers.find((c: any) => c.customer_name === chunk[0].customer_name);

      const pdfData: DeliveryNotePdfProps = {
        deliveryNoteNumber: delivery_number || chunk[0].delivery_number || '未設定',
                deliveryDate: delivery_date,
        companyInfo: {
          name: companyInfo.name,
          postalCode: companyInfo.postalCode,
          address: companyInfo.address,
          phone: companyInfo.phone,
          fax: companyInfo.fax,
          bankName: companyInfo.bankName,
          branchName: companyInfo.branchName,
          accountType: companyInfo.accountType,
          accountNumber: companyInfo.accountNumber,
          personInCharge: companyInfo.personInCharge,
        },
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
          code: representativeCustomer.code,
          postalCode: representativeCustomer.postalCode,
          address: representativeCustomer.address,
          name: representativeCustomer.name,
        } : {
          code: '',
          postalCode: '',
          address: '',
          name: '',
        },
      };

      console.log('Rendering PDF stream...');
      const pdfStream = await renderToStream(
        React.createElement(Document, null,
          React.createElement(Page, { size: "A4", style: styles.page },
            React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: true } }),
            React.createElement(DeliveryNoteContent, { data: { ...pdfData, isCopy: false } })
          )
        )
      );
      console.log('PDF stream rendered. Converting to bytes...');
      const pdfBytes = await new Promise<Uint8Array>((resolve, reject) => {
        const chunks: Buffer[] = [];
        pdfStream.on('data', (chunk) => chunks.push(chunk));
        pdfStream.on('end', () => {
          console.log('PDF stream ended.');
          resolve(Buffer.concat(chunks));
        });
        pdfStream.on('error', (err) => {
          console.error('Error during PDF stream:', err);
          reject(err);
        });
      });

      console.log('PDF bytes obtained. Loading into PDFDocument...');
      const pdfDoc = await PDFDocument.load(pdfBytes);
      console.log('PDFDocument loaded. Copying pages...');
      const copiedPages = await combinedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
      copiedPages.forEach((page) => combinedPdf.addPage(page));
      console.log('Pages copied and added to combined PDF.');
    }

    console.log('Saving combined PDF...');
    const finalPdfBytes = await combinedPdf.save();
    console.log('Combined PDF saved.');

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
