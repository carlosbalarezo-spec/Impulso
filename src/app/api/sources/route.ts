import { NextResponse } from 'next/server';
import { SOURCE_REGISTRY } from '@/lib/sources/sourceRegistry';

export async function GET() {
  try {
    return NextResponse.json({ success: true, sources: SOURCE_REGISTRY });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
