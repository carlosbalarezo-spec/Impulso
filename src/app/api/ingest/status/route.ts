import { NextResponse } from 'next/server';
import { getIngestHistory, getLastIngestTime } from '@/lib/db';

export async function GET() {
  try {
    const history = getIngestHistory();
    const lastIngestTime = getLastIngestTime();
    
    return NextResponse.json({ 
      success: true, 
      history: history.slice(-15), // return last 15 source logs
      lastIngestTime 
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
