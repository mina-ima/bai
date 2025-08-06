import { NextRequest, NextResponse } from 'next/server';
import { renderToStream, Font } from '@react-pdf/renderer';
import path from 'path';
import DeliveryNotePdf, { DeliveryNotePdfProps } from '@/components/DeliveryNotePdf';

// フォントを登録
const fontPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Regular.ttf');
const fontBoldPath = path.join(process.cwd(), 'public', 'fonts', 'NotoSansJP-Black.ttf');

Font.register({
  family: 'NotoSansJP',
  fonts: [
    { src: fontPath }, // regular
    { src: fontBoldPath, fontWeight: 'bold' },
  ],
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const pdfStream = await renderToStream(<DeliveryNotePdf data={body as DeliveryNotePdfProps} />);
    
    const headers = new Headers();
    headers.set('Content-Type', 'application/pdf');
    headers.set('Content-Disposition', 'attachment; filename="delivery_note.pdf"');

    return new NextResponse(pdfStream as any, { headers });
  } catch (error) {
    console.error('Failed to generate PDF:', error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
