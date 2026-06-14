import { NextResponse } from 'next/server';
import { getAnalytics, addAnalytics } from '@/lib/db';

export async function GET() {
  try {
    const analytics = getAnalytics();
    return NextResponse.json({ success: true, analytics });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { candidateId, title, platform, views, likes, comments, shares, saves, retentionRate, publishDate, hookUsed, duration } = body;

    if (!candidateId || !title || !platform) {
      return NextResponse.json({ success: false, error: 'Missing required fields: candidateId, title, platform' }, { status: 400 });
    }

    const record = addAnalytics({
      candidateId,
      title,
      platform,
      views: Number(views) || 0,
      likes: Number(likes) || 0,
      comments: Number(comments) || 0,
      shares: Number(shares) || 0,
      saves: Number(saves) || 0,
      retentionRate: Number(retentionRate) || 0,
      publishDate: publishDate || new Date().toISOString().split('T')[0],
      hookUsed: hookUsed || '',
      duration: Number(duration) || 0
    });

    return NextResponse.json({ success: true, record });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
