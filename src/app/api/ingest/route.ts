import { NextResponse } from 'next/server';
import { ingestAllFeeds } from '@/lib/sources/ingest';

export async function POST() {
  try {
    const result = await ingestAllFeeds();
    return NextResponse.json(result);
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
