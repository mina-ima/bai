import { NextRequest, NextResponse } from 'next/server';



export async function GET(request: NextRequest, context: any) {
  return NextResponse.json({ message: `GET request for ID: ${context.params.id}` });
}

export async function DELETE(request: NextRequest, context: any) {
  return NextResponse.json({ message: `DELETE request for ID: ${context.params.id}` });
}